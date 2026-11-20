#!/usr/bin/env node
// Pipeline runner. Dependency-free. Usage: node run.mjs [run|status|check|clean|retro|dashboard] [options]
import { loadConfig, loadRepos } from './lib/config.mjs';

const HELP = `Usage: node run.mjs <command> [options]

  run [--until HH:MM] [--repo owner/name] [--dry-run]   Work through ready issues, 3 jobs at a time (default command)
  status [--json]                                        Queue, running jobs, needs-human, merged today
  check                                                  Verify git, gh, claude, repos, labels and checks.sh
  clean                                                  Remove worktrees of closed issues
  retro [--days N]                                       Propose improvements from recent verdicts
  dashboard [--port N]                                   Local page showing the same state as status

Repos: ~/.config/pipeline/repos.txt ("owner/name /path/to/clone"). Models and caps: ~/.config/pipeline/config.json`;

const argv = process.argv.slice(2);
const known = ['run', 'status', 'check', 'clean', 'retro', 'dashboard'];
const cmd = known.includes(argv[0]) ? argv.shift() : 'run';
const opts = { dryRun: false, json: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--help' || a === '-h') { console.log(HELP); process.exit(0); }
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--json') opts.json = true;
  else if (['--until', '--repo', '--days', '--port'].includes(a)) opts[a.slice(2)] = argv[++i];
  else { console.error(`unknown option ${a}\n\n${HELP}`); process.exit(2); }
}

const cfg = loadConfig();
const repos = loadRepos();

try {
  if (cmd === 'run') {
    const { main } = await import('./lib/runner.mjs');
    await main(cfg, repos, opts);
  } else if (cmd === 'status') {
    const { collectState, formatStatus } = await import('./lib/status.mjs');
    const state = await collectState(repos);
    console.log(opts.json ? JSON.stringify(state, null, 2) : formatStatus(state));
  } else if (cmd === 'check') {
    const { check } = await import('./lib/runner.mjs');
    process.exit((await check(cfg, repos)) ? 0 : 1);
  } else if (cmd === 'clean') {
    const { clean } = await import('./lib/runner.mjs');
    await clean(cfg, repos);
  } else {
    const mod = await import(`./lib/${cmd}.mjs`).catch(() => null);
    if (!mod) throw new Error(`${cmd} is not available in this install`);
    await mod.default(cfg, repos, opts);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
