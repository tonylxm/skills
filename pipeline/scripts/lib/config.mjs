import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const expand = (p) => (p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p);

export const HOME = expand(process.env.PIPELINE_HOME ?? '~/.pipeline');
export const CONFIG_DIR = expand(process.env.PIPELINE_CONFIG_DIR ?? '~/.config/pipeline');
export const BIN = {
  gh: process.env.PIPELINE_GH ?? 'gh',
  claude: process.env.PIPELINE_CLAUDE ?? 'claude',
  git: process.env.PIPELINE_GIT ?? 'git',
};

// Models and effort live here and only here, so a model upgrade is a one-line change.
// Override any key in ~/.config/pipeline/config.json.
export const DEFAULTS = {
  slots: 3,
  jobMinutes: 90,
  maxCheckFails: 3,
  maxReviewRounds: 2,
  maxBudgetUsd: null, // per claude call; null = no cap
  jobBudgetUsd: null, // summed over a job; null = no cap
  permissionMode: 'auto', // claude --permission-mode
  worktreeRoot: path.join(HOME, 'worktrees'),
  logRoot: path.join(HOME, 'logs'),
  basePort: 3100,
  models: {
    plan: { model: 'opus', effort: 'high' },
    build: { model: 'sonnet', effort: 'medium' },
    buildHard: { model: 'opus', effort: 'high' },
    'review-code': { model: 'sonnet', effort: 'medium' },
    'review-codeHard': { model: 'opus', effort: 'high' },
    'review-ui': { model: 'sonnet', effort: 'medium' },
    'review-security': { model: 'opus', effort: 'high' },
    final: { model: 'opus', effort: 'medium' },
    retro: { model: 'opus', effort: 'high' },
  },
};

export function loadConfig() {
  const file = path.join(CONFIG_DIR, 'config.json');
  let user = {};
  if (fs.existsSync(file)) user = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { ...DEFAULTS, ...user, models: { ...DEFAULTS.models, ...(user.models ?? {}) } };
}

// repos.txt: one repo per line, "owner/name /path/to/local/clone". # starts a comment.
export function loadRepos() {
  const file = path.join(CONFIG_DIR, 'repos.txt');
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const [name, clone] = l.split(/\s+/);
      return { name, clone: expand(clone ?? '') };
    });
}

// .pipeline.yml in the clone: merge, setup, checks (scalars) and risk_paths (list). No YAML library.
export function loadRepoConfig(clone) {
  const out = { merge: 'safe', setup: null, checks: 'bash checks.sh', riskPaths: null, holdPaths: null };
  const lists = { risk_paths: 'riskPaths', hold_paths: 'holdPaths' };
  const file = path.join(clone, '.pipeline.yml');
  if (!fs.existsSync(file)) return out;
  let list = null;
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.replace(/\s+#.*$/, '').replace(/^#.*/, '').trimEnd();
    if (!line.trim()) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && list) {
      list.push(item[1].trim());
      continue;
    }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    list = null;
    if (kv[1] in lists) out[lists[kv[1]]] = list = [];
    else if (['merge', 'setup', 'checks'].includes(kv[1])) out[kv[1]] = kv[2] || out[kv[1]];
  }
  return out;
}

// Under merge policy `safe` a PR touching any of these is never auto-merged, whatever the reviewers said.
export const DEFAULT_HOLD_PATHS = ['migrations/', '.env', 'wrangler', '.github/workflows', 'auth/'];

export const DEFAULT_RISK_PATHS = [
  'auth', 'session', 'middleware', 'migrations', 'schema', '.env', 'wrangler',
  'api/', 'webhook', 'package.json', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'uv.lock',
];
