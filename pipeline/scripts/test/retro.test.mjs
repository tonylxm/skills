import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, jobFromEvents } from '../lib/retro.mjs';
import { parseEvents, verdictComment } from '../lib/verdicts.mjs';

const job = (categories, extra = {}) => ({ repo: 'o/r', pr: 1, builds: 1, checkFails: 0, rounds: 0, categories, ...extra });

test('a category seen in 3 jobs is recurring, once per job even if repeated inside one', () => {
  const r = aggregate([job(['missing-test', 'missing-test']), job(['missing-test']), job(['missing-test', 'responsive']), job(['responsive'])]);
  assert.deepEqual(r.recurring.findingCategories, [{ key: 'missing-test', n: 3 }]);
});

test('escalation reasons are grouped after stripping numbers', () => {
  const mk = (reason) => job([], { escalation: reason });
  const r = aggregate([mk('checks.sh failed 3 times'), mk('checks.sh failed 4 times'), mk('checks.sh failed 3 times'), mk('merge conflict with the base branch')]);
  assert.equal(r.recurring.escalations.length, 1);
  assert.equal(r.recurring.escalations[0].n, 3);
});

test('nothing repeated 3 times means nothing recurring', () => {
  const r = aggregate([job(['a']), job(['b']), job(['a'])]);
  assert.deepEqual(r.recurring, { findingCategories: [], escalations: [], checkFailures: [] });
});

test('jobFromEvents reads categories and fix rounds from verdict comments', () => {
  const comments = [
    verdictComment('build', 'built', 'DONE'),
    verdictComment('checks', 'x', 'FAIL', [{ severity: 'blocker', category: 'lint', issue: 'x' }]),
    verdictComment('build', 'fixed', 'DONE'),
    verdictComment('review-code', 'r', 'CHANGES', [{ severity: 'major', category: 'missing-test', issue: 'x' }]),
  ];
  const j = jobFromEvents('o/r', 5, parseEvents(comments));
  assert.equal(j.builds, 2);
  assert.equal(j.checkFails, 1);
  assert.deepEqual(j.categories.sort(), ['lint', 'missing-test']);
});
