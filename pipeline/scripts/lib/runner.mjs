import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import * as gh from './github.mjs';
import { HOME, BIN, loadRepoConfig } from './config.mjs';
import { run, killAll } from './exec.mjs';
import { parseMeta, parseDeps, overlaps, branchFor } from './verdicts.mjs';
import { runJob, worktreePath, cleanupWorktree } from './job.mjs';

const LOCK = path.join(HOME, 'run.lock');

function acquireLock() {
  fs.mkdirSync(HOME, { recursive: true });
  if (fs.existsSync(LOCK)) {
    const pid = Number(fs.readFileSync(LOCK, 'utf8'));
    try {
      process.kill(pid, 0);
      throw new Error(`another run is active (pid ${pid}). Stop it first, or delete ${LOCK} if it is stale.`);
    } catch (e) {
      if (e.code !== 'ESRCH') throw e;
    }
  }
  fs.writeFileSync(LOCK, String(process.pid));
  const release = () => fs.rmSync(LOCK, { force: true });
  process.on('exit', release);
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      console.log('\nStopping. Running jobs stay labelled in-progress: run again to resume them.');
      killAll();
      release();
      process.exit(130);
    });
  }
}

export function parseUntil(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? '');
  if (!m) throw new Error('--until needs HH:MM, e.g. --until 07:00');
  const t = new Date();
  t.setHours(Number(m[1]), Number(m[2]), 0, 0);
  if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
  return t.getTime();
}

const notify = (text) =>
  process.platform === 'darwin' && run('osascript', ['-e', `display notification ${JSON.stringify(text)} with title "pipeline"`]);

export async function main(cfg, repos, opts) {
  if (!repos.length) throw new Error('No repos configured. Add "owner/name /path/to/clone" lines to ~/.config/pipeline/repos.txt');
  if (!opts.dryRun) acquireLock();
  if (process.platform === 'darwin' && !opts.dryRun && !process.env.PIPELINE_NO_CAFFEINATE) {
    spawn('caffeinate', ['-i', '-w', String(process.pid)], { stdio: 'ignore', detached: true }).unref();
  }
  const until = opts.until ? parseUntil(opts.until) : null;
  const running = new Map(); // key -> promise
  const active = new Map(); // key -> { repo, touches, slot }
  const outcomes = [];
  const seen = new Set(); // dry run: avoid listing the same issue twice

  const freeSlot = () => {
    const used = new Set([...active.values()].map((a) => a.slot));
    for (let i = 0; i < cfg.slots; i++) if (!used.has(i)) return i;
    return -1;
  };

  async function depsClosed(repo, issue) {
    for (const d of parseDeps(issue.body)) if ((await gh.issueState(repo, d)) !== 'CLOSED') return false;
    return true;
  }

  async function fill() {
    for (const repo of repos) {
      if (opts.repo && opts.repo !== repo.name) continue;
      repo.rc = loadRepoConfig(repo.clone);
      const [resume, ready] = await Promise.all([gh.listIssues(repo.name, 'in-progress'), gh.listIssues(repo.name, 'ready')]);
      const queue = [...resume, ...ready.sort((a, b) => a.number - b.number)];
      for (const issue of queue) {
        if (freeSlot() < 0) return;
        const key = `${repo.name}#${issue.number}`;
        if (running.has(key) || seen.has(key)) continue;
        const meta = parseMeta(issue.body);
        if (!meta) {
          if (!opts.dryRun) {
            await gh.setLabels(repo.name, issue.number, { add: ['needs-human'], remove: ['ready', 'in-progress'] });
            await gh.commentIssue(repo.name, issue.number, 'Needs you: this issue has no pipeline metadata. Run `plan` on it first.');
          }
          seen.add(key);
          continue;
        }
        if (!(await depsClosed(repo.name, issue))) continue;
        const clash = [...active.entries()].some(([k, a]) => a.repo === repo.name && overlaps(meta.touches, a.touches));
        if (clash) continue;

        const slot = freeSlot();
        if (opts.dryRun) {
          console.log(`would start ${key} "${issue.title}" in slot ${slot} (touches: ${meta.touches.join(', ') || 'unknown'})`);
          seen.add(key);
          active.set(key, { repo: repo.name, touches: meta.touches, slot });
          continue;
        }
        console.log(`start ${key} "${issue.title}" slot ${slot}`);
        await gh.setLabels(repo.name, issue.number, { add: ['in-progress'], remove: ['ready'] });
        active.set(key, { repo: repo.name, touches: meta.touches, slot });
        const p = runJob(cfg, repo, issue, meta, slot).then((o) => {
          running.delete(key);
          active.delete(key);
          outcomes.push(o);
          console.log(`${o.result === 'merged' ? 'merged' : 'needs-human'} ${key}: ${o.detail}`);
        });
        running.set(key, p);
      }
    }
  }

  for (;;) {
    if (!(until && Date.now() >= until)) await fill();
    if (opts.dryRun) break;
    if (!running.size) break;
    await Promise.race(running.values());
  }

  if (!opts.dryRun) {
    const merged = outcomes.filter((o) => o.result === 'merged');
    const stuck = outcomes.filter((o) => o.result !== 'merged');
    const lines = [
      `Run finished${until && Date.now() >= until ? ' (--until reached)' : ''}: ${merged.length} merged, ${stuck.length} need you.`,
      ...merged.map((o) => `  ✓ ${o.repo}#${o.issue} ${o.title} (${o.minutes} min, $${o.cost}) ${o.detail}`),
      ...stuck.map((o) => `  ! ${o.repo}#${o.issue} ${o.title}: ${o.detail}`),
      stuck.length ? 'Next: run `plan` to answer the needs-human issues, then run again.' : 'Next: nothing waiting. Plan new issues when ready.',
    ];
    console.log(lines.join('\n'));
    await notify(lines[0]);
  }
  return outcomes;
}

// Removes worktrees whose issue is closed.
export async function clean(cfg, repos) {
  let removed = 0;
  for (const repo of repos) {
    const root = path.join(cfg.worktreeRoot, repo.name.replace('/', '__'));
    if (!fs.existsSync(root)) continue;
    for (const n of fs.readdirSync(root)) {
      if ((await gh.issueState(repo.name, Number(n)).catch(() => 'OPEN')) !== 'CLOSED') continue;
      await cleanupWorktree(repo.clone, worktreePath(cfg, repo.name, n));
      console.log(`removed ${repo.name}#${n}`);
      removed++;
    }
  }
  console.log(`${removed} worktree(s) removed`);
}

export async function check(cfg, repos) {
  const rows = [];
  const ok = (name, pass, note = '') => rows.push({ name, pass, note });
  for (const [name, bin] of Object.entries(BIN)) {
    const r = await run(bin, ['--version']);
    ok(name, r.code === 0, r.code === 0 ? r.stdout.split('\n')[0] : `not found: ${bin}`);
  }
  ok('node', true, process.version);
  const auth = await run(BIN.gh, ['auth', 'status']);
  ok('gh auth', auth.code === 0, auth.code === 0 ? '' : 'run: gh auth login');
  if (!repos.length) ok('repos', false, 'none in ~/.config/pipeline/repos.txt');
  for (const repo of repos) {
    const git = await run(BIN.git, ['rev-parse', '--git-dir'], { cwd: repo.clone });
    ok(`${repo.name} clone`, git.code === 0, git.code === 0 ? repo.clone : `not a git repo: ${repo.clone}`);
    ok(`${repo.name} checks.sh`, fs.existsSync(path.join(repo.clone, 'checks.sh')), 'copy pipeline/templates/checks.sh');
    const labels = await run(BIN.gh, ['label', 'list', '--repo', repo.name, '--json', 'name']);
    const have = labels.code === 0 ? JSON.parse(labels.stdout).map((l) => l.name) : [];
    const missing = ['ready', 'in-progress', 'needs-human'].filter((l) => !have.includes(l));
    ok(`${repo.name} labels`, labels.code === 0 && !missing.length, missing.length ? `missing: ${missing.join(', ')} (bash pipeline/templates/labels.sh ${repo.name})` : '');
  }
  for (const r of rows) console.log(`${r.pass ? '✓' : '✗'} ${r.name}${r.note ? `  ${r.note}` : ''}`);
  return rows.every((r) => r.pass);
}
