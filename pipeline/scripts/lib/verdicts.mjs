// Pure helpers: parse pipeline comments, derive a job's state from them, route reviews.
import { DEFAULT_RISK_PATHS } from './config.mjs';

export const META_RE = /<!--\s*pipeline:\s*(\{[\s\S]*?\})\s*-->/;
const VERDICT_RE = /<!-- pipeline:([a-z-]+) -->([\s\S]*?)VERDICT:\s*([A-Z-]+)(?:\s*```json\s*([\s\S]*?)```)?/;

export function parseMeta(body) {
  const m = META_RE.exec(body ?? '');
  if (!m) return null;
  try {
    const j = JSON.parse(m[1]);
    return { size: j.size ?? 'S', risk: j.risk ?? [], touches: j.touches ?? [] };
  } catch {
    return null;
  }
}

export const parseDeps = (body) =>
  [...(body ?? '').matchAll(/Depends on #(\d+)/gi)].map((m) => Number(m[1]));

export function branchFor(issue) {
  const type = /^(feat|fix|chore)\b/.exec(issue.title)?.[1] ?? 'feat';
  const slug = issue.title.replace(/^\w+(\([^)]*\))?:\s*/, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40).replace(/-$/, '');
  return `${type}/${issue.number}-${slug || 'work'}`;
}

export function verdictComment(stage, summary, verdict, findings = []) {
  return `<!-- pipeline:${stage} -->\n${summary}\n\nVERDICT: ${verdict}\n\`\`\`json\n${JSON.stringify({ stage, findings })}\n\`\`\`\n`;
}

export function parseEvents(comments) {
  const events = [];
  for (const body of comments) {
    const m = VERDICT_RE.exec(body);
    if (!m) continue;
    let findings = [];
    try {
      findings = JSON.parse(m[4] ?? '{}').findings ?? [];
    } catch {
      /* summary only */
    }
    events.push({ stage: m[1], verdict: m[3], summary: m[2].trim(), findings });
  }
  return events;
}

export function route(files, meta, riskPaths) {
  const paths = riskPaths ?? DEFAULT_RISK_PATHS;
  const modes = ['review-code'];
  if (meta.risk.includes('ui') || files.some((f) => /\.(tsx|jsx|vue|svelte|astro|css|scss|html)$/.test(f))) modes.push('review-ui');
  const secRisk = meta.risk.some((r) => ['auth', 'data', 'money', 'deps'].includes(r));
  if (secRisk || files.some((f) => paths.some((p) => f.toLowerCase().includes(p.toLowerCase())))) modes.push('review-security');
  return modes;
}

export const isHard = (meta, builds) => meta.risk.some((r) => ['auth', 'data', 'money'].includes(r)) || builds >= 2;

// Walks the verdict history. phase: build | checks | review | final | merge | escalated | blocked.
export function deriveState(events, requiredByRoute) {
  let phase = 'build';
  let builds = 0, checkFails = 0, rounds = 0;
  let reviews = {}, findings = [], rerun = null, reason = '';
  for (const e of events) {
    if (e.stage === 'build') {
      if (e.verdict === 'BLOCKED') { phase = 'blocked'; reason = e.summary; continue; }
      const changed = Object.entries(reviews).filter(([, v]) => v === 'CHANGES').map(([k]) => k);
      if (changed.length) { rounds++; rerun = new Set(['review-code', ...changed]); }
      builds++; reviews = {}; findings = []; phase = 'checks';
    } else if (e.stage === 'checks') {
      if (e.verdict === 'PASS') { phase = 'review'; reviews = {}; }
      else { checkFails++; findings = e.findings; phase = 'build'; }
    } else if (e.stage.startsWith('review-')) {
      reviews[e.stage] = e.verdict;
      if (e.verdict === 'CHANGES') findings = [...findings, ...e.findings];
    } else if (e.stage === 'final') {
      phase = e.verdict === 'APPROVE' ? 'merge' : 'escalated';
      reason = e.summary;
    }
  }
  const required = rerun ? [...rerun] : requiredByRoute;
  let reviewRound = false;
  if (phase === 'review') {
    if (!required.every((m) => reviews[m])) phase = 'review';
    else if (Object.values(reviews).includes('CHANGES')) { phase = 'build'; reviewRound = true; }
    else phase = 'final';
  }
  return { phase, builds, checkFails, rounds, reviews, findings, required, reason, reviewRound };
}

// One row per build attempt, for the dashboard: build verdict, checks result, each review's verdict.
// A new `build` event starts a new row, same as deriveState counts builds.
export function roundsFrom(events) {
  const rounds = [];
  let final = null;
  for (const e of events) {
    if (e.stage === 'build') rounds.push({ build: e.verdict, checks: null, reviews: {} });
    else if (e.stage === 'final') final = e.verdict;
    else if (rounds.length && e.stage === 'checks') rounds.at(-1).checks = e.verdict;
    else if (rounds.length && e.stage.startsWith('review-')) rounds.at(-1).reviews[e.stage.slice(7)] = e.verdict;
  }
  return { rounds, final };
}

export const overlaps = (a, b) =>
  !a.length || !b.length || a.some((x) => b.some((y) => x === y || x.startsWith(`${y}/`) || y.startsWith(`${x}/`)));
