import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOME } from './config.mjs';
import { collectState } from './status.mjs';
import * as gh from './github.mjs';
import { parseEvents, branchFor } from './verdicts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(here, '..', 'dashboard');
const HEALTH = path.resolve(here, '..', '..', '..', 'docs', 'skill-health.md');
const FLOW = path.resolve(here, '..', '..', '..', 'docs', 'flow.svg');
const TTL_MS = 20000;
const FONT = path.join(PAGE, 'geist.woff2');

// Rows of the first markdown table in docs/skill-health.md.
export function parseHealth(md) {
  return md.split('\n').filter((l) => l.startsWith('|')).slice(2)
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((c) => c.length >= 4)
    .map(([skill, status, lastRun, notes]) => ({ skill, status, lastRun, notes }));
}

function latestRetro() {
  const dir = path.join(HOME, 'retro');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  if (!files.length) return null;
  const { since, jobs, recurring } = JSON.parse(fs.readFileSync(path.join(dir, files.at(-1)), 'utf8'));
  return { since, jobs, recurring, file: files.at(-1) };
}

// Issue body plus every verdict comment on its PR, oldest first. Fetched when a card is opened, not per poll.
async function jobDetail(repo, n) {
  const view = await gh.issueView(repo, n);
  const pr = await gh.findPR(repo, branchFor({ number: n, title: view.title }));
  const events = pr ? parseEvents(await gh.prComments(repo, pr.number)) : [];
  return { title: view.title, issue: view.body ?? '', events };
}

const send = (res, code, type, body) => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

// Read-only, bound to localhost. Shows what `status` shows, plus retro patterns and skill health.
export default async function dashboard(cfg, repos, opts) {
  const port = Number(opts.port ?? 4173);
  let cache = { t: 0, value: null };
  const demo = opts.demo ? JSON.parse(fs.readFileSync(path.join(PAGE, 'demo.json'), 'utf8')) : null;

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === '/' || req.url === '/index.html') return send(res, 200, 'text/html; charset=utf-8', fs.readFileSync(path.join(PAGE, 'index.html')));
      if (req.url === '/flow.svg') return send(res, 200, 'image/svg+xml', fs.readFileSync(FLOW));
      if (req.url === '/api/state') {
        if (demo) return send(res, 200, 'application/json', JSON.stringify({ ...demo.state, generatedAt: new Date().toISOString() }));
        if (Date.now() - cache.t > TTL_MS) cache = { t: Date.now(), value: await collectState(repos) };
        return send(res, 200, 'application/json', JSON.stringify(cache.value));
      }
      if (req.url === '/geist.woff2' && fs.existsSync(FONT)) return send(res, 200, 'font/woff2', fs.readFileSync(FONT));
      if (req.url.startsWith('/api/job?')) {
        const q = new URL(req.url, 'http://x').searchParams;
        const repo = q.get('repo') ?? '', n = Number(q.get('n'));
        if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !Number.isInteger(n) || n < 1) return send(res, 400, 'application/json', JSON.stringify({ error: 'bad repo or number' }));
        if (demo) return send(res, 200, 'application/json', JSON.stringify(demo.jobs?.[`${repo}#${n}`] ?? { issue: '', events: [] }));
        return send(res, 200, 'application/json', JSON.stringify(await jobDetail(repo, n)));
      }
      if (req.url === '/api/retro') return send(res, 200, 'application/json', JSON.stringify(demo ? demo.retro : latestRetro()));
      if (req.url === '/api/health') {
        const md = fs.existsSync(HEALTH) ? fs.readFileSync(HEALTH, 'utf8') : '';
        return send(res, 200, 'application/json', JSON.stringify(parseHealth(md)));
      }
      send(res, 404, 'text/plain', 'not found');
    } catch (e) {
      send(res, 502, 'application/json', JSON.stringify({ error: e.message }));
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  console.log(`Dashboard: http://127.0.0.1:${port}${demo ? '  (demo data)' : ''}  Ctrl-C to stop`);
  await new Promise(() => {});
}
