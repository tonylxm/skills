# ROADMAP.md format

```md
# Roadmap

_Current: Phase 1: {name}. Done phases: [archive](docs/roadmap-archive.md) (link added once the archive exists)._

## ✅ Phase 0: Walking skeleton (done {YYYY-MM-DD})

## Phase 1: {name}
Goal: {one line, the user-visible outcome}. PRD: F1, F2 (feature IDs from the MVP_PRD.md scope table)
- [ ] {Task, verb-first} (#12)
  - AC: {observable criterion}
  - AC: {observable criterion}
- [ ] {Independent task} (parallel)
  - AC: {observable criterion}
- [x] {Done task}

## Phase 2: {name}
Goal: {one line}. _Tasks added when the phase starts._
```

Rules:
- Only the current phase is broken into tasks. Later phases stay one line until `plan` reaches them.
- Each task fits on one line. Acceptance criteria are indented beneath it, and they are observable results, not implementation steps.
- When a phase closes, collapse it to its `✅` heading line and move its task list to `docs/roadmap-archive.md`.
- `(parallel)` marks a task with no unfinished dependencies whose files don't overlap other `(parallel)` tasks, so it can be built in its own worktree.
- Future ideas go in `TODO.md`, not in an unplanned phase.
