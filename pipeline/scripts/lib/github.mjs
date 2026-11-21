import { run } from './exec.mjs';
import { BIN } from './config.mjs';

async function gh(args, input) {
  const r = await run(BIN.gh, args, { input });
  if (r.code !== 0) throw new Error(`gh ${args.slice(0, 3).join(' ')} failed: ${r.stderr.trim() || r.stdout.trim()}`);
  return r.stdout;
}
const json = async (args) => JSON.parse((await gh(args)) || 'null');

export const listIssues = (repo, label) =>
  json(['issue', 'list', '--repo', repo, '--label', label, '--state', 'open', '--limit', '100',
    '--json', 'number,title,body,labels,createdAt']);

export const issueState = async (repo, n) =>
  (await json(['issue', 'view', String(n), '--repo', repo, '--json', 'state'])).state;

export const issueView = (repo, n) =>
  json(['issue', 'view', String(n), '--repo', repo, '--json', 'title,body']);

export const setLabels = (repo, n, { add = [], remove = [] }) => {
  const args = ['issue', 'edit', String(n), '--repo', repo];
  for (const l of add) args.push('--add-label', l);
  for (const l of remove) args.push('--remove-label', l);
  return gh(args);
};

export const commentIssue = (repo, n, body) => gh(['issue', 'comment', String(n), '--repo', repo, '--body-file', '-'], body);
export const commentPR = (repo, n, body) => gh(['pr', 'comment', String(n), '--repo', repo, '--body-file', '-'], body);

export async function findPR(repo, branch) {
  const prs = await json(['pr', 'list', '--repo', repo, '--head', branch, '--state', 'all', '--limit', '5',
    '--json', 'number,state,url,title,mergedAt,createdAt']);
  return prs.find((p) => p.state === 'OPEN') ?? prs[0] ?? null;
}

export const prComments = async (repo, n) =>
  (await json(['pr', 'view', String(n), '--repo', repo, '--json', 'comments'])).comments.map((c) => c.body);

export const prFiles = async (repo, n) =>
  (await gh(['pr', 'diff', String(n), '--repo', repo, '--name-only'])).split('\n').filter(Boolean);

export const prState = (repo, n) =>
  json(['pr', 'view', String(n), '--repo', repo, '--json', 'state,mergedAt,url']);

// Waits for CI. No checks reported (repo has none) counts as green after two polls.
export async function waitForChecks(repo, n, { intervalMs = Number(process.env.PIPELINE_CI_POLL_MS ?? 30000), timeoutMs = 20 * 60000 } = {}) {
  const end = Date.now() + timeoutMs;
  let empty = 0;
  while (Date.now() < end) {
    let checks = [];
    try {
      checks = await json(['pr', 'checks', String(n), '--repo', repo, '--json', 'name,bucket']);
    } catch {
      checks = [];
    }
    if (!checks.length) {
      if (++empty >= 2) return { ok: true };
    } else {
      empty = 0;
      const bad = checks.find((c) => c.bucket === 'fail' || c.bucket === 'cancel');
      if (bad) return { ok: false, reason: `CI check failed: ${bad.name}` };
      if (checks.every((c) => c.bucket === 'pass' || c.bucket === 'skipping')) return { ok: true };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { ok: false, reason: 'CI did not finish within 20 minutes' };
}

export const mergePR = async (repo, n, cwd) => {
  const r = await run(BIN.gh, ['pr', 'merge', String(n), '--repo', repo, '--squash', '--delete-branch'], { cwd });
  return r; // caller verifies the state: gh may exit non-zero only because the local branch is in a worktree
};

export const mergedToday = (repo) =>
  json(['pr', 'list', '--repo', repo, '--state', 'merged', '--limit', '30',
    '--search', `merged:>=${new Date().toISOString().slice(0, 10)}`, '--json', 'number,title,url,mergedAt']);

export async function issueLastComment(repo, n) {
  const c = (await json(['issue', 'view', String(n), '--repo', repo, '--json', 'comments'])).comments;
  return c.length ? c[c.length - 1].body : '';
}
