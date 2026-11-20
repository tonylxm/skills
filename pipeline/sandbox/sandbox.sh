#!/usr/bin/env bash
# Create the pipeline sandbox: a private repo from a template, the pipeline labels, and five fixed issues.
set -euo pipefail

if [ "${1:-}" = "--help" ] || [ $# -ne 2 ]; then
  echo "Usage: bash sandbox.sh <owner>/<template> <owner>/<new-sandbox-repo>"
  exit 0
fi

here=$(cd "$(dirname "$0")" && pwd)
gh repo create "$2" --template "$1" --private
sleep 5
bash "$here/../templates/labels.sh" "$2"
for f in "$here"/0*.md; do
  gh issue create --repo "$2" --title "$(head -1 "$f")" --body-file <(tail -n +3 "$f")
done
echo "Created $2. Next: clone it, add it to ~/.config/pipeline/repos.txt, run /plan, then the runner."
