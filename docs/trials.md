# Trials and audit list

Summary: what was evaluated for v2 and why. Research date 2026-11-28; star counts are rough. Update a row after a trial.

| Item | Verdict | Why |
|---|---|---|
| Matt Pocock skills | **Adopted** (subset, vendored) | Terse and modular, 4 already vendored |
| Impeccable | **Adopt**, install per project | Most complete design skill (`live`, `generate`, 62-rule detector). Ships a binary, so not vendored |
| Emil Kowalski skills | **Adopted**: `animation-vocabulary`, `prototype` | Motion naming and variant picker that Impeccable lacks. Skip the rest (they repeat Impeccable) |
| `/advisor`, `/ship`, `/simplify`, `/code-review`, `/batch` | **Use** | Built in, replace the v1 pipeline |
| claude-code-setup plugin | Run once, then uninstall | One-off recommender |
| Napkin (blader) | Skip (vendored and reviewed 2026-11-28) | Duplicates built-in memory and `retro`, adds a notes file to every repo and a read at every session start |
| Ponytail | Skip (vendored and reviewed 2026-11-28) | Its option ladder is already in `conventions`. Only the closing "skipped or unchecked" line was new, now a rule there |
| Cloudflare `security-audit` (named "cloudflare-security-review" in the brief) | Install on demand | Heavy, for pre-launch audits only |
| superpowers | Skip | Overlaps Pocock 1:1 and is verbose. `systematic-debugging` replaced by `diagnosing-bugs` |
| claude-mem | Skip | Bun, Chroma and an observer agent. Against "simple" and "token-efficient" |
| Founder skill | Skip | No canonical repo, business not dev, overlaps `market-research` |
| Taste | Skip | Duplicates Impeccable's core, main line marked experimental. Fallback if Impeccable is too heavy |
| awesome-design-md | Reference | Copy one brand file per project when a "looks like X" start helps |
| UX Planet 50 design styles | Reference | Vocabulary for prompting styles: [article](https://uxplanet.org/50-design-styles-every-designer-should-know-for-better-prompting-56c09d55db62) |

## Open
- v2 dry run on a real project (see [workflow.md](workflow.md)).
- Phone push via ntfy needs approval first (new service).
- Cutover wiring of the harness into `~/.claude` needs approval.
