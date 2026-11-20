import fs from 'node:fs';
import path from 'node:path';
import * as gh from './github.mjs';
import { run, tail } from './exec.mjs';
import { BIN, DEFAULT_HOLD_PATHS } from './config.mjs';
import { runStage } from './claude.mjs';
import { branchFor, parseEvents, deriveState, route, verdictComment, isHard } from './verdicts.mjs';

class Escalate extends Error {}
const git = (cwd, args) => run(BIN.git, args, { cwd });
const safeName = (repo) => repo.replace('/', '__');

export const worktreePath = (cfg, repo, n) => path.join(cfg.worktreeRoot, safeName(repo), String(n));

export async function baseBranch(clone) {
  const r = await git(clone, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  return r.code === 0 ? r.stdout.trim().replace(/^origin\//, '') : 'main';
}

export async function cleanupWorktree(clone, wt) {
  const b = await git(wt, ['branch', '--show-current']);
  await git(clone, ['worktree', 'remove', '--force', wt]);
  if (b.code === 0 && b.stdout.trim()) await git(clone, ['branch', '-D', b.stdout.trim()]);
  await git(clone, ['worktree', 'prune']);
  await git(clone, ['fetch', '--prune', 'origin']);
}

export async function runJob(cfg, repo, issue, meta, slot) {
  const started = Date.now();
  const deadline = started + cfg.jobMinutes * 60000;
  const branch = branchFor(issue);
  const wt = worktreePath(cfg, repo.name, issue.number);
  const base = await baseBranch(repo.clone);
  const env = {
    PIPELINE_PORT: String(cfg.basePort + slot * 10),
    PORT: String(cfg.basePort + slot * 10),
    E2E_PORT: String(cfg.basePort + slot * 10 + 1),
    DB_PORT: String(5433 + slot),
  };
  let cost = 0;
  let pr = null;

  const remaining = () => {
    const ms = deadline - Date.now();
    if (ms <= 0) throw new Escalate(`exceeded the ${cfg.jobMinutes}-minute job cap`);
    return ms;
  };
  const logName = (stage) => path.join(cfg.logRoot, safeName(repo.name), `${issue.number}-${stage}-${Date.now()}.log`);
  const header = (stage, extra = '') =>
    `PIPELINE-STAGE: ${stage} | repo=${repo.name} | issue=${issue.number} | branch=${branch} | base=${base}${pr ? ` | pr=${pr.number}` : ''}${extra}`;
  const count = async () => (pr ? parseEvents(await gh.prComments(repo.name, pr.number)).length : 0);

  async function stage(name, tier, prompt) {
    const before = await count();
    const r = await runStage(cfg, { stage: name, tier, prompt, cwd: wt, env, timeoutMs: remaining(), logName: logName(name) });
    cost += r.cost;
    if (cfg.jobBudgetUsd && cost > cfg.jobBudgetUsd) throw new Escalate(`job spend $${cost.toFixed(2)} passed the $${cfg.jobBudgetUsd} cap`);
    if (r.timedOut) throw new Escalate(`${name} exceeded the job time cap`);
    if (!r.ok) throw new Escalate(`${name} failed: ${r.error}`);
    return before;
  }

  async function ensureWorktree() {
    if (fs.existsSync(path.join(wt, '.git'))) return;
    await git(repo.clone, ['fetch', 'origin']);
    const remote = await git(repo.clone, ['rev-parse', '--verify', '-q', `origin/${branch}`]);
    fs.mkdirSync(path.dirname(wt), { recursive: true });
    const r = await git(repo.clone, ['worktree', 'add', '-B', branch, wt, remote.code === 0 ? `origin/${branch}` : `origin/${base}`]);
    if (r.code !== 0) throw new Escalate(`worktree failed: ${tail(r.stderr, 5)}`);
    for (const f of fs.readdirSync(repo.clone)) {
      const src = path.join(repo.clone, f);
      if (/^\.env/.test(f) && f !== '.env.example' && fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(wt, f));
    }
    if (repo.rc.setup) {
      const s = await run('bash', ['-c', repo.rc.setup], { cwd: wt, env, timeoutMs: Math.min(remaining(), 15 * 60000) });
      if (s.code !== 0) throw new Escalate(`setup failed: ${tail(s.stderr || s.stdout, 8)}`);
    }
  }

  async function runChecks() {
    const r = await run('bash', ['-c', repo.rc.checks], { cwd: wt, env, timeoutMs: Math.min(remaining(), 20 * 60000) });
    if (r.timedOut) throw new Escalate('checks.sh exceeded 20 minutes');
    return { pass: r.code === 0, log: tail(`${r.stdout}\n${r.stderr}`, 60) };
  }

  const postChecks = (pass, log) =>
    gh.commentPR(repo.name, pr.number, verdictComment('checks', pass ? 'checks.sh passed.' : 'checks.sh failed.', pass ? 'PASS' : 'FAIL',
      pass ? [] : [{ severity: 'blocker', file: '', line: 0, issue: log, fix: 'Fix the failing step' }]));

  // Brings the branch up to date with base. Returns 'current' | 'rebased' | 'conflict'.
  async function syncWithBase() {
    await git(wt, ['fetch', 'origin']);
    if ((await git(wt, ['merge-base', '--is-ancestor', `origin/${base}`, 'HEAD'])).code === 0) return 'current';
    if ((await git(wt, ['rebase', `origin/${base}`])).code !== 0) {
      await git(wt, ['rebase', '--abort']);
      return 'conflict';
    }
    const p = await git(wt, ['push', '--force-with-lease', 'origin', `HEAD:${branch}`]);
    if (p.code !== 0) throw new Escalate(`push after rebase failed: ${tail(p.stderr, 5)}`);
    return 'rebased';
  }

  // Rebases if needed; true when the branch is ready to go on, false when checks failed and the loop must fix it.
  async function freshen() {
    const s = await syncWithBase();
    if (s === 'conflict') throw new Escalate('merge conflict with the base branch');
    if (s === 'current') return true;
    const c = await runChecks();
    if (c.pass) return true;
    await postChecks(false, c.log);
    return false;
  }

  const buildPrompt = (kind, st) =>
    `${header(kind)}\nUse the dev-loop skill in pipeline mode. You are in the job's worktree on branch ${branch}; base is ${base}.\n` +
    (kind === 'build'
      ? `Implement issue #${issue.number}. If the branch or PR already exists, continue from it.\n\n# ${issue.title}\n${issue.body}\n\nWhen done: run checks, push the branch, open the PR from the repo's PR template (starting "Closes #${issue.number}") and post the build verdict comment.`
      : `Fix only these open findings on the PR, keep scope, push to the same branch, then post the build verdict comment:\n${JSON.stringify(st.findings, null, 1)}`) +
    `\nDecisions the issue leaves open: follow plan/choice-rules.md. A consequential one means BLOCKED.`;

  try {
    await ensureWorktree();
    for (;;) {
      remaining();
      pr = await gh.findPR(repo.name, branch);
      if (pr?.state === 'MERGED') return await finish(pr);
      if (pr?.state === 'CLOSED') throw new Escalate('the PR was closed without merging');
      const events = pr ? parseEvents(await gh.prComments(repo.name, pr.number)) : [];
      const files = pr ? await gh.prFiles(repo.name, pr.number) : [];
      const st = deriveState(events, route(files, meta, repo.rc.riskPaths));

      switch (st.phase) {
        case 'blocked':
        case 'escalated':
          throw new Escalate(st.reason);

        case 'build': {
          if (st.checkFails >= cfg.maxCheckFails) throw new Escalate(`checks.sh failed ${st.checkFails} times`);
          if (st.reviewRound && st.rounds >= cfg.maxReviewRounds) throw new Escalate(`review still wants changes after ${st.rounds} rounds`);
          const kind = st.builds === 0 ? 'build' : 'fix';
          const before = await stage(kind, isHard(meta, st.builds) ? 'buildHard' : 'build', buildPrompt(kind, st));
          pr = await gh.findPR(repo.name, branch);
          if (!pr) throw new Escalate('build finished without opening a PR');
          if ((await count()) <= before) throw new Escalate('build posted no verdict comment');
          break;
        }

        case 'checks': {
          const c = await runChecks();
          await postChecks(c.pass, c.log);
          break;
        }

        case 'review': {
          const missing = st.required.filter((m) => !st.reviews[m]);
          const hard = isHard(meta, 0);
          const before = await count();
          await Promise.all(missing.map((m) =>
            stage(m, m === 'review-code' && hard ? 'review-codeHard' : m,
              `${header(m, ` | mode=${m.replace('review-', '')}`)}\nUse the review skill, mode ${m.replace('review-', '')}, on PR #${pr.number} of ${repo.name}. Read-only: do not edit code. Post one verdict comment on the PR.`)));
          if ((await count()) - before < missing.length) throw new Escalate('a review posted no verdict comment');
          break;
        }

        case 'final': {
          if (!(await freshen())) break;
          const before = await stage('final', 'final',
            `${header('final')}\nUse the review skill, mode final, on PR #${pr.number} of ${repo.name}. Merge policy: ${repo.rc.merge}. Do not merge: post the verdict comment only.`);
          if ((await count()) <= before) throw new Escalate('final review posted no verdict comment');
          break;
        }

        case 'merge': {
          if (repo.rc.merge === 'none') throw new Escalate(`ready to merge, policy is none: ${pr.url}`);
          if (repo.rc.merge === 'safe') {
            const held = files.find((f) => (repo.rc.holdPaths ?? DEFAULT_HOLD_PATHS).some((p) => f.toLowerCase().includes(p.toLowerCase())));
            if (held) throw new Escalate(`held for you: the PR touches ${held} (merge policy safe never auto-merges it): ${pr.url}`);
          }
          if (!(await freshen())) break;
          const ci = await gh.waitForChecks(repo.name, pr.number);
          if (!ci.ok) throw new Escalate(ci.reason);
          await gh.mergePR(repo.name, pr.number, repo.clone);
          const s = await gh.prState(repo.name, pr.number);
          if (s.state !== 'MERGED') throw new Escalate('gh pr merge did not complete');
          return await finish(pr);
        }
      }
    }
  } catch (e) {
    const reason = e instanceof Escalate ? e.message : `unexpected: ${e.message}`;
    try {
      await gh.setLabels(repo.name, issue.number, { add: ['needs-human'], remove: ['in-progress', 'ready'] });
      await gh.commentIssue(repo.name, issue.number,
        `Needs you: ${reason}\n\nPR: ${pr?.url ?? 'none yet'}\nWorktree kept at \`${wt}\`. Answer or fix, then label the issue \`ready\` to resume.`);
    } catch {
      /* labels failed too: report only */
    }
    return outcome('needs-human', reason);
  }

  async function finish(merged) {
    await gh.setLabels(repo.name, issue.number, { remove: ['in-progress', 'ready'] }).catch(() => {});
    await cleanupWorktree(repo.clone, wt);
    pr = merged;
    return outcome('merged', merged.url);
  }

  function outcome(result, detail) {
    return { repo: repo.name, issue: issue.number, title: issue.title, result, detail,
      minutes: Math.round((Date.now() - started) / 60000), cost: Number(cost.toFixed(2)) };
  }
}
