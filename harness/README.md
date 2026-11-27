# Harness

Summary: Claude Code config that belongs with the skills: model-routed subagents, done alerts, a lean output style. Versioned here, wired into `~/.claude` at cutover (nothing is wired yet).

| File | Purpose |
|---|---|
| [agents/scout.md](agents/scout.md) | Haiku, read-only search and log triage |
| [agents/reviewer.md](agents/reviewer.md) | Opus, fresh-context review of a diff |
| [output-styles/lean.md](output-styles/lean.md) | Answer first, no filler, ends with `Next:` |
| [hooks/notify.sh](hooks/notify.sh) | macOS alert on Stop and Notification (needs `jq`) |
| [hooks/settings-snippet.json](hooks/settings-snippet.json) | Hooks and `outputStyle` to merge into `~/.claude/settings.json` |

## Model routing
| Work | Model | How |
|---|---|---|
| Search, log triage | Haiku | `scout` agent |
| Build, review | Sonnet | Subagent default (`CLAUDE_CODE_SUBAGENT_MODEL=sonnet`, already the setup). Built-in Explore and Plan ignore it |
| Final review, plans | Opus | `reviewer` agent |
| Big decisions | Opus | `/advisor opus` (advisor must rank at or above the main model, so it cannot be Haiku) |

## Wire in (needs approval, changes every session)
1. Link the agents and style: `ln -s` each file from `~/.claude/agents/` and `~/.claude/output-styles/`. Link files, not the directories: symlinked directories are undocumented.
2. Merge `settings-snippet.json` into `~/.claude/settings.json` with the `update-config` skill. Restart so the output style loads.
3. Update `~/.claude/CLAUDE.md`: point comment rules at `conventions`, fix the dead `code-floor.md` link, drop the UI line that names `frontend-design`.
4. Switch `~/.claude/skills` to the v2 checkout when `v2` is merged to `main`.

## Parallel runs
`claude --bg "<prompt>" --name <ticket>` (or `/bg`, `/fork`) starts a background session. `claude agents` shows them all, `claude logs <name>` tails one, `--worktree` gives each its own branch. The hooks alert you when each one finishes.

Source for the schemas above: code.claude.com docs (sub-agents, hooks, output-styles, advisor, agent-view), checked 2026-11-28. Phone push (ntfy) is not set up; it needs a new service.
