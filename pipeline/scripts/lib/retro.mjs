import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIN, HOME } from './config.mjs';
import { run as exec } from './exec.mjs';
import { parseEvents } from './verdicts.mjs';
import { baseArgs } from './claude.mjs';

const SKILLS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const normalise = (s) => s.toLowerCase().replace(/\d+/g, 'N').replace(/`[^`]*`/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);

// jobs: [{ repo, pr, builds, checkFails, rounds, categories: [], escalation?: string }]
export function aggregate(jobs, threshold = 3) {
  const count = (items) => {
    const m = new Map();
    for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
    return [...m.entries()].filter(([, n]) => n >= threshold).sort((a, b) => b[1] - a[1]).map(([key, n]) => ({ key, n }));
  };
  return {
    jobs: jobs.length,
    recurring: {
      findingCategories: count(jobs.flatMap((j) => [...new Set(j.categories)])),
      escalations: count(jobs.filter((j) => j.escalation).map((j) => normalise(j.escalation))),
      checkFailures: jobs.filter((j) => j.checkFails > 0).length >= threshold ? [{ key: 'checks.sh failed before review', n: jobs.filter((j) => j.checkFails > 0).length }] : [],
    },
  };
}

export function jobFromEvents(repo, pr, events) {
  const categories = events.flatMap((e) => e.findings.map((f) => f.category).filter(Boolean));
  return {
    repo, pr,
    builds: events.filter((e) => e.stage === 'build' && e.verdict === 'DONE').length,
    checkFails: events.filter((e) => e.stage === 'checks' && e.verdict === 'FAIL').length,
    rounds: Math.max(0, events.filter((e) => e.stage === 'build' && e.verdict === 'DONE').length - 1),
    categories,
  };
}

async function ghJson(args) {
  const r = await exec(BIN.gh, args);
  if (r.code !== 0) throw new Error(r.stderr.trim());
  return JSON.parse(r.stdout);
}

export default async function retro(cfg, repos, opts) {
  const days = Number(opts.days ?? 14);
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const jobs = [];
  for (const repo of repos) {
    const prs = await ghJson(['pr', 'list', '--repo', repo.name, '--state', 'merged', '--limit', '100', '--search', `merged:>=${since}`, '--json', 'number,comments']);
    for (const p of prs) jobs.push(jobFromEvents(repo.name, p.number, parseEvents(p.comments.map((c) => c.body))));
    const issues = await ghJson(['issue', 'list', '--repo', repo.name, '--state', 'all', '--limit', '100', '--json', 'number,comments,updatedAt']);
    for (const i of issues.filter((x) => x.updatedAt.slice(0, 10) >= since)) {
      const esc = i.comments.map((c) => /^Needs you: (.*)/m.exec(c.body)?.[1]).filter(Boolean);
      for (const reason of esc) jobs.push({ repo: repo.name, pr: null, builds: 0, checkFails: 0, rounds: 0, categories: [], escalation: reason });
    }
  }
  const result = { since, ...aggregate(jobs), jobsDetail: jobs };
  const dir = path.join(HOME, 'retro');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(file, JSON.stringify(result, null, 1));

  const rec = result.recurring;
  const any = rec.findingCategories.length + rec.escalations.length + rec.checkFailures.length;
  console.log(`${jobs.length} jobs since ${since}. Data: ${file}`);
  for (const [k, items] of Object.entries(rec)) for (const i of items) console.log(`  repeated ${i.n}x (${k}): ${i.key}`);
  if (!any) return console.log('Nothing repeated 3 times. No proposals.');
  if (opts.collectOnly) return;

  const m = cfg.models.retro;
  console.log('Asking the retro agent for proposals (PRs only, nothing is merged)...');
  const r = await exec(BIN.claude, baseArgs(cfg, m),
    { cwd: SKILLS_ROOT, input: `PIPELINE-STAGE: retro | data=${file}\nFollow pipeline/retro.md on the data file. Open PRs only, never merge.\n`, timeoutMs: 30 * 60000 });
  console.log(r.code === 0 ? 'Retro agent finished. Review the PRs it opened.' : `Retro agent failed: ${r.stderr.trim().slice(0, 300) || r.stdout.slice(0, 300)}`);
}
