import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseArgs } from '../lib/claude.mjs';
import { DEFAULTS } from '../lib/config.mjs';

test('spend caps are on by default: $5 per call, $15 per job', () => {
  assert.equal(DEFAULTS.maxBudgetUsd, 5);
  assert.equal(DEFAULTS.jobBudgetUsd, 15);
});

test('every headless stage denies prompts instead of waiting and loads no MCP servers', () => {
  const args = baseArgs(DEFAULTS, DEFAULTS.models.build);
  assert.equal(args[args.indexOf('--permission-prompts') + 1], 'none');
  assert.ok(args.includes('--strict-mcp-config'));
  assert.ok(!args.includes('--dangerously-skip-permissions'));
  assert.notEqual(args[args.indexOf('--permission-mode') + 1], 'bypassPermissions');
});
