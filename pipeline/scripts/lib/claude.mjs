import fs from 'node:fs';
import path from 'node:path';
import { run, tail } from './exec.mjs';
import { BIN } from './config.mjs';

// One stage = one fresh headless claude process in the job's worktree (clean context, killable).
// The prompt's first line is a machine header; the rest names the skill to follow.
export async function runStage(cfg, { stage, tier = stage, prompt, cwd, env, timeoutMs, logName }) {
  const m = cfg.models[tier] ?? cfg.models[stage];
  const args = ['-p', '--model', m.model, '--effort', m.effort, '--permission-mode', cfg.permissionMode,
    '--output-format', 'json', '--no-session-persistence'];
  if (cfg.maxBudgetUsd) args.push('--max-budget-usd', String(cfg.maxBudgetUsd));
  const r = await run(BIN.claude, args, { cwd, env, input: prompt, timeoutMs });

  fs.mkdirSync(path.dirname(logName), { recursive: true });
  fs.writeFileSync(logName, `# ${stage} (${m.model}, ${m.effort}) exit ${r.code}${r.timedOut ? ' TIMEOUT' : ''}\n${r.stdout}\n${r.stderr}`);

  let cost = 0;
  let isError = r.code !== 0;
  let error = tail(r.stderr || r.stdout, 15);
  try {
    const out = JSON.parse(r.stdout);
    cost = Number(out.total_cost_usd ?? 0);
    isError = isError || out.is_error === true;
    if (out.is_error && out.result) error = String(out.result).slice(0, 300);
  } catch {
    /* non-JSON output: rely on exit code */
  }
  return { ok: !isError && !r.timedOut, timedOut: r.timedOut, cost, error };
}
