# Pipeline flow

_Source of truth for the shape of the flow. Contracts: [pipeline](../pipeline/SKILL.md). Decisions: [pipeline-plan.md](pipeline-plan.md)._

## One issue, end to end

```mermaid
flowchart TD
  issue["GitHub issue"] --> plan{"plan (you, interactive)"}
  plan -->|READY| ready["label: ready"]
  plan -->|SPLIT| sub["sub-issues"] --> ready
  plan -->|NEEDS-INFO| ask["ask the author"] --> plan
  plan -->|REJECT| closed["closed with a reason"]

  ready --> slot{"free slot and no touches overlap?"}
  slot -->|yes| job["worktree + branch"]
  job --> build["build (dev-loop)"]
  build --> checks{"checks.sh"}
  checks -->|"FAIL (up to 3)"| build
  checks -->|PASS| reviews["reviews in parallel: code, ui, security (routed by the diff)"]
  reviews -->|"CHANGES (up to 2 rounds)"| build
  reviews -->|APPROVE| final{"final review + merge policy"}
  final -->|APPROVE| merge["squash merge, PR closes the issue"]
  final -->|ESCALATE| human["label: needs-human"]
  build -.->|"BLOCKED, caps, 90 min"| human
  human --> plan
  merge --> cleanup["remove worktree, free the slot"]
  cleanup --> slot
  merge -.-> retro["retro (weekly): repeated problems become PRs"]
```

## Issue labels

```mermaid
stateDiagram-v2
  state "in-progress" as in_progress
  state "needs-human" as needs_human
  [*] --> unlabelled
  unlabelled --> ready: plan READY
  unlabelled --> closed: plan REJECT
  ready --> in_progress: runner takes a slot
  in_progress --> closed: PR merged
  in_progress --> needs_human: blocked, cap hit or escalated
  needs_human --> ready: answered in plan
```

## Where the human is needed

| When | What you do | How to reduce it |
|---|---|---|
| `plan` | Answer one batch of questions | Good issue forms, fewer open decisions |
| `needs-human` issues | Decide, then re-run `plan` | Merge policy `safe`, clear no-go list, retro turns repeat escalations into rules |
| `merge: none` repos | Merge each PR | Use only for client sites with real users |
