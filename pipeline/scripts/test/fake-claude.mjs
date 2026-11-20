#!/usr/bin/env node
// Test double for `claude -p`: plays the build, review and final stages from db.behavior.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { lock } from './lock.mjs';

if (process.argv.includes('--version')) { console.log('claude fake'); process.exit(0); }
const prompt = fs.readFileSync(0, 'utf8');
const h = /PIPELINE-STAGE: (\S+) \| repo=(\S+) \| issue=(\d+) \| branch=(\S+)/.exec(prompt);
const [, stage, , issue, branch] = h;
const prNum = /\| pr=(\d+)/.exec(prompt)?.[1];
const DB = process.env.FAKE_DB;
const gh = (args, input) => execFileSync(process.env.PIPELINE_GH, args, { input, env: process.env, encoding: 'utf8' });
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const read = () => JSON.parse(fs.readFileSync(DB, 'utf8'));
const mutate = (fn) => { const un = lock(DB); try { const d = read(); fn(d); fs.writeFileSync(DB, JSON.stringify(d, null, 1)); } finally { un(); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const verdict = (s, v) => `<!-- pipeline:${s} -->\nfake ${s}\n\nVERDICT: ${v}\n\`\`\`json\n{"stage":"${s}","findings":[{"severity":"major","file":"a","line":1,"issue":"x","fix":"y"}]}\n\`\`\`\n`;
const behavior = (() => { const un = lock(DB); try { return read().behavior; } finally { un(); } })();
const t0 = Date.now();

if (stage === 'build' || stage === 'fix') {
  await sleep(behavior.buildMs ?? 100);
  fs.writeFileSync(`work-${issue}-${Date.now()}.txt`, 'x');
  git('add', '-A');
  git('commit', '-q', '-m', 'feat: work');
  git('push', '-q', 'origin', `HEAD:${branch}`);
  let n = prNum;
  if (!n) n = gh(['pr', 'create', '--head', branch, '--title', 'feat: work', '--files', (behavior.files ?? ['src/a.ts']).join(','), '--body-file', '-'], `Closes #${issue}`).trim().split('/').pop();
  gh(['pr', 'comment', n, '--body-file', '-'], verdict('build', behavior.build ?? 'DONE'));
} else if (stage.startsWith('review-')) {
  const mode = stage.replace('review-', '');
  let v = 'APPROVE';
  mutate((d) => {
    d.counters[mode] = (d.counters[mode] ?? 0) + 1;
    const seq = d.behavior.reviews?.[mode];
    if (seq) v = seq[Math.min(d.counters[mode], seq.length) - 1];
  });
  gh(['pr', 'comment', prNum, '--body-file', '-'], verdict(stage, v));
} else if (stage === 'final') {
  gh(['pr', 'comment', prNum, '--body-file', '-'], verdict('final', behavior.final ?? 'APPROVE'));
}
mutate((d) => d.log.push({ issue: Number(issue), stage, t0, t1: Date.now() }));
console.log(JSON.stringify({ total_cost_usd: 0.01, is_error: false, result: 'ok' }));
