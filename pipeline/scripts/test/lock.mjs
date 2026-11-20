import fs from 'node:fs';

// Cross-process lock for the fakes' shared JSON file (parallel stages write it at once).
export function lock(file) {
  const dir = `${file}.lock`;
  for (;;) {
    try {
      fs.mkdirSync(dir);
      break;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }
  }
  return () => fs.rmSync(dir, { recursive: true, force: true });
}
