#!/usr/bin/env bash
# Static checks for a skills repo: names, descriptions, skill references and relative links.
# Templates are skipped because their links point into the generated project, not this repo.
set -uo pipefail

if [ "${1:-}" = "--help" ]; then
  echo "Usage: bash refine-skill/check.sh   (run from the skills repo root; exits 1 on any failure)"
  exit 0
fi

fail=0
report() { echo "$1"; fail=1; }

# Prose only: drops fenced code blocks and inline code, where example links and refs live.
prose() { awk '/^ *```/ { code = !code; next } !code' "$1" | sed -E 's/`[^`]*`//g'; }

check_links() {
  local file=$1 dir link target
  dir=$(dirname "$file")
  while read -r link; do
    target=${link%%#*}
    case "$target" in ''|http*|mailto:*|*'{'*|*'<'*|*'…'*) continue ;; esac
    [ -e "$dir/$target" ] || report "broken link in $file: $link"
  done < <(prose "$file" | grep -oE '\]\([^) ]+\)' | sed -E 's/^\]\(//; s/\)$//')
}

for d in */; do
  d=${d%/}; f="$d/SKILL.md"
  [ -f "$f" ] || continue
  name=$(sed -n 's/^name: *//p' "$f" | head -1)
  [ "$name" = "$d" ] || report "name mismatch: $d ($name)"
  grep -q '^description: ..' "$f" || report "missing description: $d"
  while read -r ref; do
    [ -d "$ref" ] || report "broken skill ref in $d: $ref"
  done < <(prose "$f" | grep -oE 'Skill tool (with|twice, for) "[^"]+"( and "[^"]+")?' | grep -oE '"[^"]+"' | tr -d '"')
  while read -r md; do check_links "$md"; done < <(find "$d" -name '*.md' -not -name 'template*.md' -not -path '*/templates/*')
done

for md in *.md; do [ -f "$md" ] && check_links "$md"; done

[ "$fail" = 0 ] && echo "skills check passed"
exit "$fail"
