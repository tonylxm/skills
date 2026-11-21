import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvents, verdictComment, roundsFrom } from '../lib/verdicts.mjs';

const events = (...specs) => parseEvents(specs.map(([stage, verdict]) => verdictComment(stage, 's', verdict)));

test('a CHANGES review then a rebuild starts a second round', () => {
  const { rounds, final } = roundsFrom(events(
    ['build', 'DONE'], ['checks', 'PASS'], ['review-code', 'CHANGES'], ['review-ui', 'PASS'],
    ['build', 'DONE'], ['checks', 'PASS'], ['review-code', 'PASS'], ['final', 'APPROVE']));
  assert.equal(rounds.length, 2);
  assert.deepEqual(rounds[0], { build: 'DONE', checks: 'PASS', reviews: { code: 'CHANGES', ui: 'PASS' } });
  assert.deepEqual(rounds[1].reviews, { code: 'PASS' });
  assert.equal(final, 'APPROVE');
});

test('a failed check keeps its round and the next build opens another', () => {
  const { rounds } = roundsFrom(events(['build', 'DONE'], ['checks', 'FAIL'], ['build', 'DONE'], ['checks', 'PASS']));
  assert.deepEqual(rounds.map((r) => r.checks), ['FAIL', 'PASS']);
});

test('no events gives no rounds and no final verdict', () => {
  assert.deepEqual(roundsFrom([]), { rounds: [], final: null });
});

test('a blocked build is a round with no checks', () => {
  assert.deepEqual(roundsFrom(events(['build', 'BLOCKED'])).rounds, [{ build: 'BLOCKED', checks: null, reviews: {} }]);
});
