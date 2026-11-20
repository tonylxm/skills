import { spawn } from 'node:child_process';

const live = new Set();
export function killAll() {
  for (const pid of live) {
    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      /* gone */
    }
  }
}

// Runs a command to completion. Never throws: failures come back as { code }.
// On timeout the whole process group is killed, so dev servers started by a stage die with it.
export function run(cmd, args = [], { cwd, env, input, timeoutMs } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true,
    });
    live.add(child.pid);
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const kill = (signal) => {
      try {
        process.kill(-child.pid, signal);
      } catch {
        /* already gone */
      }
    };
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          kill('SIGTERM');
          setTimeout(() => kill('SIGKILL'), 5000).unref();
        }, timeoutMs)
      : null;
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.stdin.on('error', () => {});
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: String(e), timedOut });
    });
    child.on('close', (code) => {
      live.delete(child.pid);
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr, timedOut });
    });
    child.stdin.end(input ?? '');
  });
}

export const tail = (text, lines = 40) => text.trimEnd().split('\n').slice(-lines).join('\n');
