---
name: cli-tooling
description: Use when working in a codebase through the shell and a task needs structural code search or rewrite (all call sites, rename a function, change a pattern across files), reading or editing JSON or YAML config, GitHub work (PRs, issues, CI runs), or fast file and text search outside an agent's built-in search tools.
---

# CLI tooling

Pick the fastest non-interactive tool for the job. Done when the task's shell work uses the tools below, or their fallbacks, with no pagers or prompts.

## Rules

1. **Built-in tools first.** If the agent has dedicated search, glob or read tools (e.g. Claude Code's Grep, Glob, Read), use them. Use the shell tools below for what they can't do: structural matches, rewrites, config edits, GitHub.
2. **Just run it.** Don't pre-check with `which`. If a command is not found, use the fallback and carry on. Mention the install line once at the end only if the tool would have saved real effort.
3. **Never block on a pager or prompt.** Set `GIT_PAGER=cat` or use `git --no-pager`, pass `--color=never` when piping, prefer `gh ... --json`, and avoid interactive flags (`-i`, `fzf`, editors).
4. **Dry-run rewrites.** Preview every multi-file change, then apply it.

## Tools

| Task | Tool | Canonical command | Fallback |
| --- | --- | --- | --- |
| Text search | `rg` | `rg -n "pattern" -t ts` · `rg -l -F "exact.name"` | `grep -rn` |
| Find files | `fd` | `fd -e ts` · `fd -t d components` · `fd -H .env` | `find . -name` |
| Structural search | `ast-grep` | `ast-grep -p 'fetchData($$$ARGS)' -l ts` | `rg` with a careful regex |
| Structural rewrite | `ast-grep` | `ast-grep -p 'old($A)' -r 'new($A)' -l ts` (preview), then add `-U` | Edit each match |
| Count structural matches | `ast-grep` | `ast-grep -p 'console.log($$$)' -l js --json=stream \| wc -l` | `rg -c` |
| JSON | `jq` | `jq '.scripts' package.json` · `jq -r '.items[].name'` | `python3 -c 'import json,sys; ...'` |
| YAML (read/edit) | `yq` (mikefarah, v4) | `yq '.jobs' ci.yml` · `yq -i '.version = "2.0.0"' f.yaml` · `yq -o=json f.yaml` | `python3` with PyYAML |
| GitHub | `gh` | `gh pr view --json title,state` · `gh run view --log-failed` · `gh api repos/{owner}/{repo}` | `git` plus the web UI |

Notes:
- Call it `ast-grep`, not `sg` (clashes with the Linux `sg` command). `$X` matches one node, `$$$` matches many.
- `yq` means mikefarah's Go version. The Python `yq` wrapper has different syntax; check with `yq --version`.
- `rg` and `fd` respect `.gitignore` and skip hidden files. Add `--hidden` / `-H` (and `--no-ignore` / `-I`) when looking for dotfiles or ignored output.

## Install (macOS)

```bash
brew install ripgrep fd ast-grep yq jq gh
```

Human-only extras, not for agents (colour and pagers): `bat`, `git-delta`, `fzf`.
