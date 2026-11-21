import * as gh from './github.mjs';
import { branchFor, parseEvents, deriveState, route, parseMeta, roundsFrom } from './verdicts.mjs';
import { loadRepoConfig } from './config.mjs';

export async function collectState(repos) {
  const out = [];
  for (const repo of repos) {
    const rc = loadRepoConfig(repo.clone);
    const [ready, progress, human, merged] = await Promise.all([
      gh.listIssues(repo.name, 'ready'),
      gh.listIssues(repo.name, 'in-progress'),
      gh.listIssues(repo.name, 'needs-human'),
      gh.mergedToday(repo.name).catch(() => []),
    ]);
    const jobs = [];
    for (const issue of progress) {
      const pr = await gh.findPR(repo.name, branchFor(issue));
      let phase = 'build', detail = 'no PR yet', rounds = [], required = [], final = null;
      const meta = parseMeta(issue.body);
      if (pr) {
        const events = parseEvents(await gh.prComments(repo.name, pr.number));
        const files = await gh.prFiles(repo.name, pr.number).catch(() => []);
        const st = deriveState(events, route(files, parseMeta(issue.body) ?? { risk: [] }, rc.riskPaths));
        phase = st.phase;
        ({ rounds, final } = roundsFrom(events));
        required = st.required.map((m) => m.replace(/^review-/, ''));
        detail = `PR #${pr.number}, checks failed ${st.checkFails}x, review rounds ${st.rounds}`;
      }
      jobs.push({ number: issue.number, title: issue.title, phase, detail, rounds, required, final,
        pr: pr ? { number: pr.number, url: pr.url, createdAt: pr.createdAt } : null,
        meta: meta ? { size: meta.size, risk: meta.risk } : null });
    }
    const blocked = [];
    for (const issue of human) {
      const last = await gh.issueLastComment(repo.name, issue.number).catch(() => '');
      blocked.push({ number: issue.number, title: issue.title, reason: last.split('\n')[0].replace(/^Needs you:\s*/, '') });
    }
    out.push({
      repo: repo.name,
      ready: ready.map((i) => ({ number: i.number, title: i.title })),
      inProgress: jobs,
      needsHuman: blocked,
      mergedToday: merged.map((p) => ({ number: p.number, title: p.title, url: p.url })),
    });
  }
  return { generatedAt: new Date().toISOString(), repos: out };
}

export function formatStatus(state) {
  const lines = [];
  for (const r of state.repos) {
    lines.push(`${r.repo}`);
    lines.push(`  ready ${r.ready.length} | in progress ${r.inProgress.length} | needs you ${r.needsHuman.length} | merged today ${r.mergedToday.length}`);
    for (const j of r.inProgress) lines.push(`  → #${j.number} ${j.title} [${j.phase}] ${j.detail}`);
    for (const b of r.needsHuman) lines.push(`  ! #${b.number} ${b.title}: ${b.reason}`);
    for (const m of r.mergedToday) lines.push(`  ✓ #${m.number} ${m.title}`);
  }
  return lines.join('\n') || 'No repos configured. Add lines to ~/.config/pipeline/repos.txt';
}
