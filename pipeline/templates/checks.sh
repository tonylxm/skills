#!/usr/bin/env bash
# The pipeline gate. The builder runs it locally and CI runs the same script as the required check.
# Contract: exit 0 = pass. Output is quiet: on failure the last 60 lines of the failing step,
# and the final line is always "CHECKS: PASS" or "CHECKS: FAIL <step>".
# Replace the commands below with this repo's own (AGENTS.md → Commands). Keep cheap steps first.
set -uo pipefail

if [ "${1:-}" = "--help" ]; then
  echo "Usage: bash checks.sh   (exit 0 = pass; last line CHECKS: PASS | CHECKS: FAIL <step>)"
  exit 0
fi

steps=(conventions lint typecheck test build)

conventions() {
  local branch=${GITHUB_HEAD_REF:-$(git branch --show-current)}
  case "$branch" in main|master|"") return 0 ;; esac
  [[ $branch =~ ^(feat|fix|chore)/[0-9]+-[a-z0-9-]+$ ]] ||
    { echo "branch '$branch' must match feat|fix|chore/<issue>-<slug>"; return 1; }
  # Needs full history in CI (fetch-depth: 0). Skipped when origin/main is unknown.
  git rev-parse --verify -q origin/main >/dev/null || return 0
  local bad
  bad=$(git log origin/main..HEAD --format=%s |
    grep -v -E '^(feat|fix|chore|docs|refactor|test|perf|build|ci)(\([^)]+\))?: .{1,72}$' || true)
  [ -z "$bad" ] || { echo "not Conventional Commits (subject ≤72 chars):"; echo "$bad"; return 1; }
}
lint()      { echo "TODO: replace with this repo's lint command" >&2; return 1; }
typecheck() { echo "TODO: replace with this repo's typecheck command" >&2; return 1; }
test()      { echo "TODO: replace with this repo's test command" >&2; return 1; }
build()     { echo "TODO: replace with this repo's build command" >&2; return 1; }

for step in "${steps[@]}"; do
  if ! out=$("$step" 2>&1); then
    printf '%s\n' "$out" | tail -n 60
    echo "CHECKS: FAIL $step"
    exit 1
  fi
done
echo "CHECKS: PASS"
