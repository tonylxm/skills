#!/usr/bin/env node
// Test double for `gh`: GitHub state in the JSON file named by FAKE_DB. Only what the runner calls.
import fs from 'node:fs';
import { lock } from './lock.mjs';

const DB = process.env.FAKE_DB;
const release = lock(DB);
process.on('exit', release);
const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
const save = () => fs.writeFileSync(DB, JSON.stringify(db, null, 1));
const a = process.argv.slice(2);
const flag = (n) => (a.includes(n) ? a[a.indexOf(n) + 1] : undefined);
const flags = (n) => a.flatMap((x, i) => (x === n ? [a[i + 1]] : []));
const stdin = () => fs.readFileSync(0, 'utf8');
const out = (v) => console.log(typeof v === 'string' ? v : JSON.stringify(v));
const issue = (n) => db.issues.find((i) => i.number === Number(n));
const pr = (n) => db.prs.find((p) => p.number === Number(n));
const [grp, cmd] = a;

if (a[0] === '--version') out('gh fake 1.0');
else if (grp === 'auth') out('ok');
else if (grp === 'label') out(db.labels.map((name) => ({ name })));
else if (grp === 'issue' && cmd === 'list') {
  const label = flag('--label');
  out(db.issues.filter((i) => i.state === 'OPEN' && i.labels.includes(label)).map((i) => ({ ...i, labels: i.labels.map((name) => ({ name })), createdAt: '2026-01-01' })));
} else if (grp === 'issue' && cmd === 'view') {
  const i = issue(a[2]);
  out({ state: i.state, comments: i.comments.map((body) => ({ body })) });
} else if (grp === 'issue' && cmd === 'edit') {
  const i = issue(a[2]);
  i.labels = i.labels.filter((l) => !flags('--remove-label').includes(l));
  for (const l of flags('--add-label')) if (!i.labels.includes(l)) i.labels.push(l);
  save();
} else if (grp === 'issue' && cmd === 'comment') {
  issue(a[2]).comments.push(stdin());
  save();
} else if (grp === 'pr' && cmd === 'list') {
  const head = flag('--head');
  const state = flag('--state');
  out(db.prs.filter((p) => (head ? p.branch === head : true) && (state === 'merged' ? p.state === 'MERGED' : true)));
} else if (grp === 'pr' && cmd === 'view') {
  const p = pr(a[2]);
  out({ ...p, comments: p.comments.map((body) => ({ body })) });
} else if (grp === 'pr' && cmd === 'diff') out(pr(a[2]).files.join('\n'));
else if (grp === 'pr' && cmd === 'comment') {
  pr(a[2]).comments.push(stdin());
  save();
} else if (grp === 'pr' && cmd === 'create') {
  const number = db.prs.length + 1;
  db.prs.push({ number, state: 'OPEN', url: `https://example.test/pr/${number}`, title: flag('--title'), branch: flag('--head'),
    body: stdin(), files: (flag('--files') ?? '').split(',').filter(Boolean), comments: [], mergedAt: null });
  save();
  out(`https://example.test/pr/${number}`);
} else if (grp === 'pr' && cmd === 'merge') {
  const p = pr(a[2]);
  p.state = 'MERGED';
  p.mergedAt = new Date().toISOString();
  const m = /Closes #(\d+)/.exec(p.body);
  if (m) issue(m[1]).state = 'CLOSED';
  db.mergeOrder.push(Number(m?.[1]));
  save();
} else if (grp === 'pr' && cmd === 'checks') out([]);
else {
  console.error(`fake gh: unsupported ${a.join(' ')}`);
  process.exit(1);
}
