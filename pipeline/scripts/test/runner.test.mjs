import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const RUN = path.join(here, '..', 'run.mjs');
const meta = (touches, risk = []) => `<!-- pipeline: ${JSON.stringify({ size: 'S', risk, touches })} -->`;
const issue = (number, title, touches, extra = '', risk = []) =>
  ({ number, title, body: `## Goal\nx\n${extra}\n${meta(touches, risk)}`, labels: ['ready'], state: 'OPEN', comments: [] });

function setup({ issues, behavior = {}, checksFails = 0, repoYml = '', config = {} }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pl-'));
  const sh = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });
  sh(tmp, 'init', '-q', '--bare', '-b', 'main', 'origin.git');
  sh(tmp, 'clone', '-q', 'origin.git', 'clone');
  const clone = path.join(tmp, 'clone');
  fs.writeFileSync(path.join(clone, 'checks.sh'), `#!/usr/bin/env bash
f="$FAKE_DB.checks"; n=$(cat "$f" 2>/dev/null || echo 0)
if [ "$n" -gt 0 ]; then echo $((n-1)) > "$f"; echo boom; exit 1; fi
`);
  if (repoYml) fs.writeFileSync(path.join(clone, '.pipeline.yml'), repoYml);
  sh(clone, 'add', '-A'); sh(clone, 'commit', '-q', '-m', 'chore: init'); sh(clone, 'push', '-q', 'origin', 'HEAD:main');
  const db = path.join(tmp, 'db.json');
  fs.writeFileSync(db, JSON.stringify({ issues, prs: [], labels: ['ready', 'in-progress', 'needs-human'], behavior, counters: {}, log: [], mergeOrder: [] }));
  fs.writeFileSync(`${db}.checks`, String(checksFails));
  const cfgDir = path.join(tmp, 'cfg');
  fs.mkdirSync(cfgDir);
  fs.writeFileSync(path.join(cfgDir, 'repos.txt'), `o/r ${clone}\n`);
  fs.writeFileSync(path.join(cfgDir, 'config.json'), JSON.stringify({ worktreeRoot: path.join(tmp, 'wt'), logRoot: path.join(tmp, 'logs'), ...config }));
  const env = { ...process.env, FAKE_DB: db, PIPELINE_GH: path.join(here, 'fake-gh.mjs'), PIPELINE_CLAUDE: path.join(here, 'fake-claude.mjs'),
    PIPELINE_HOME: path.join(tmp, 'home'), PIPELINE_CONFIG_DIR: cfgDir, PIPELINE_NO_CAFFEINATE: '1', PIPELINE_NO_NOTIFY: '1', PIPELINE_CI_POLL_MS: '5',
    GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
  const go = (args = ['run']) => spawnSync('node', [RUN, ...args], { env, encoding: 'utf8', timeout: 90000 });
  const read = () => JSON.parse(fs.readFileSync(db, 'utf8'));
  return { tmp, go, read, wt: path.join(tmp, 'wt') };
}
const labels = (d, n) => d.issues.find((i) => i.number === n).labels;

test('happy path: one issue becomes a merged PR and the worktree is removed', () => {
  const t = setup({ issues: [issue(1, 'feat: add form', ['src/a'])] });
  const r = t.go();
  const d = t.read();
  assert.match(r.stdout, /1 merged, 0 need you/, r.stdout + r.stderr);
  assert.equal(d.prs[0].state, 'MERGED');
  assert.equal(d.issues[0].state, 'CLOSED');
  assert.ok(!labels(d, 1).includes('in-progress'));
  assert.ok(!fs.existsSync(path.join(t.wt, 'o__r', '1')));
});

test('jobs with overlapping touches run one after another, others run alongside', () => {
  const t = setup({
    behavior: { buildMs: 400 },
    issues: [issue(1, 'feat: one', ['src/forms']), issue(2, 'feat: two', ['src/forms']), issue(3, 'feat: three', ['docs'])],
  });
  const r = t.go();
  const log = t.read().log.filter((l) => l.stage === 'build');
  const at = (n) => log.find((l) => l.issue === n);
  assert.match(r.stdout, /3 merged/, r.stdout + r.stderr);
  assert.ok(at(2).t0 >= at(1).t1, 'issue 2 waited for issue 1');
  assert.ok(at(3).t0 < at(1).t1, 'issue 3 ran alongside issue 1');
});

test('Depends on #N holds an issue until the dependency is closed', () => {
  const t = setup({ issues: [issue(1, 'feat: base', ['a']), issue(2, 'feat: next', ['b'], 'Depends on #1')] });
  const r = t.go();
  assert.match(r.stdout, /2 merged/, r.stdout + r.stderr);
  assert.deepEqual(t.read().mergeOrder, [1, 2]);
});

test('checks.sh failing 3 times sends the issue to needs-human', () => {
  const t = setup({ issues: [issue(1, 'fix: broken', ['a'])], checksFails: 9 });
  const r = t.go();
  const d = t.read();
  assert.match(r.stdout, /0 merged, 1 need you/, r.stdout + r.stderr);
  assert.ok(labels(d, 1).includes('needs-human'));
  assert.match(d.issues[0].comments.join('\n'), /checks\.sh failed 3 times/);
});

test('review CHANGES triggers one fix round, then merges', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { reviews: { code: ['CHANGES', 'APPROVE'] } } });
  const r = t.go();
  const d = t.read();
  assert.match(r.stdout, /1 merged/, r.stdout + r.stderr);
  assert.equal(d.log.filter((l) => l.stage === 'fix').length, 1);
});

test('review that never approves escalates after 2 fix rounds', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { reviews: { code: ['CHANGES'] } } });
  const r = t.go();
  assert.match(r.stdout, /0 merged, 1 need you/, r.stdout + r.stderr);
  assert.match(t.read().issues[0].comments.join('\n'), /after 2 rounds/);
});

test('UI and risk paths add the ui and security reviews', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { files: ['src/Button.tsx', 'src/auth/session.ts'] } });
  t.go();
  const stages = t.read().log.map((l) => l.stage);
  assert.ok(stages.includes('review-ui') && stages.includes('review-security') && stages.includes('review-code'), stages.join());
});

test('merge policy none stops at ready-to-merge', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])], repoYml: 'merge: none\n' });
  const r = t.go();
  assert.match(r.stdout, /0 merged, 1 need you/, r.stdout + r.stderr);
  assert.match(t.read().issues[0].comments.join('\n'), /policy is none/);
  assert.equal(t.read().prs[0].state, 'OPEN');
});

test('policy safe holds a PR that touches a migration, even when every review approves', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { files: ['db/migrations/001_add.sql'] } });
  const r = t.go();
  assert.match(r.stdout, /0 merged, 1 need you/, r.stdout + r.stderr);
  assert.match(t.read().issues[0].comments.join('\n'), /held for you/);
  assert.equal(t.read().prs[0].state, 'OPEN');
});

test('policy all merges a migration PR, and hold_paths can be overridden per repo', () => {
  const all = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { files: ['db/migrations/001_add.sql'] }, repoYml: 'merge: all\n' });
  assert.match(all.go().stdout, /1 merged/);
  const own = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { files: ['db/migrations/001_add.sql'] }, repoYml: 'hold_paths:\n  - billing/\n' });
  assert.match(own.go().stdout, /1 merged/);
});

test('final ESCALATE hands the issue to the human', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])], behavior: { final: 'ESCALATE' } });
  const r = t.go();
  assert.match(r.stdout, /0 merged, 1 need you/, r.stdout + r.stderr);
});

test('an issue without pipeline metadata is sent back to plan', () => {
  const t = setup({ issues: [{ number: 1, title: 'feat: raw', body: 'no meta', labels: ['ready'], state: 'OPEN', comments: [] }] });
  t.go();
  assert.ok(labels(t.read(), 1).includes('needs-human'));
  assert.match(t.read().issues[0].comments.join('\n'), /Run `plan`/);
});

test('--dry-run starts nothing and changes nothing', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])] });
  const r = t.go(['run', '--dry-run']);
  assert.match(r.stdout, /would start o\/r#1/);
  assert.deepEqual(labels(t.read(), 1), ['ready']);
});

test('status and check work against the fakes', () => {
  const t = setup({ issues: [issue(1, 'feat: x', ['a'])] });
  assert.match(t.go(['status']).stdout, /ready 1/);
  const c = t.go(['check']);
  assert.match(c.stdout, /✓ labels|✓ o\/r labels/, c.stdout);
});
