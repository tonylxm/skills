# docs/ROADMAP.md format

```md
# Roadmap

_Done phases: [archive](roadmap-archive.md) (added once the archive exists)._

## ✅ Phase 0: Walking skeleton (done {YYYY-MM-DD})

## Phase 1: {name}
Goal: {one line, the user-visible outcome}. PRD: F1, F2 (feature IDs from the docs/PRD.md MVP scope table)
- [ ] 1.1 {Task, verb-first}
  - AC: {observable criterion}
  - AC: {observable criterion}
- [ ] 1.2 {Task}
  - AC: {observable criterion}
  - BLOCKED: {reason and evidence}
- [x] 1.3 {Done task}

## Phase 2: {name}
Goal: {one line}. _Tasks added when the phase starts._
Review notes:
- {assumption made in Phase 1 to confirm, or something to try in the app}

## Later
- {deferred idea or follow-up}: {why, who asked}
```

Rules:
- Each task starts with an ID `<phase>.<n>`. IDs are permanent: never renumber. A task added later takes the next free number, even if it runs earlier. `build 1.3` can use the ID.
- A split phase becomes subphases (`## Phase 1a: {name}`, `## Phase 1b: {name}`), each a phase in its own right with its own tasks (`1a.1`), branch (`feat/phase-1a`) and PR. Split before any task is checked.
- Only the current phase is broken into tasks. Later phases stay one line until `plan` reaches them.
- Each task fits on one line. Acceptance criteria are indented beneath it, and they are observable results, not implementation steps.
- When a phase closes, collapse it to its `✅` heading line and move it to `docs/roadmap-archive.md` as `## Phase N: {name} (done {YYYY-MM-DD})`, its Goal line, and its task list as it was (checkboxes and ACs kept), newest at the bottom. Nothing else: the close report lives in the commit or PR. Nothing reads the archive, so its size costs nothing.
- The current phase is the first heading without `✅`; the header never names it.
- A stuck task stays unchecked with an indented `- BLOCKED: {reason and evidence}` line beneath it. Delete that line once it's unblocked. `- BLOCKED (setup): {numbered steps}` marks a task waiting on the user's accounts or keys: it keeps its phase open and is retried on every run. `- BLOCKED (decision): {question; options, recommended first; stash name}` marks a task waiting on a consequential choice: it keeps its phase open, isn't carried over by `close`, and sends the next run to `plan`, which asks it. An optional `- Model: opus|sonnet` overrides build's default model for a task. A `- Decision: {answer} (stash: {name})` note records the `plan` answer; build pops that stash.
- `Review notes:` under a phase heading are written by `close` and removed by the next `plan` once answered. A `carried over: {task, reason, stash}` note is a blocked task moved from the previous phase; `plan` turns it into a task (with a new ID) unless the user drops it.
- Future ideas and follow-ups go in Later, one line each, not in an unplanned phase. Nothing in Later is scheduled until `plan` moves it into a phase.
