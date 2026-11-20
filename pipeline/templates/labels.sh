#!/usr/bin/env bash
# Create the three pipeline labels. Safe to re-run.
set -euo pipefail

if [ "${1:-}" = "--help" ]; then
  echo "Usage: bash labels.sh [owner/repo]   (default: the repo in the current folder)"
  exit 0
fi

repo=()
[ -n "${1:-}" ] && repo=(--repo "$1")

gh label create ready --color 0E8A16 --description "Planned, waiting for a free slot" --force ${repo[@]+"${repo[@]}"}
gh label create in-progress --color FBCA04 --description "A pipeline job owns this" --force ${repo[@]+"${repo[@]}"}
gh label create needs-human --color D93F0B --description "Stuck or escalated, needs a decision" --force ${repo[@]+"${repo[@]}"}
