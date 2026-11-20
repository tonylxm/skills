# Sandbox

Five fixed issues for regression-testing the pipeline on a throwaway repo made from your Astro template. Replay after changing `plan`, `dev-loop`, `review` or the runner, and compare with the last run in [skill-health](../../docs/skill-health.md).

```bash
bash ~/.agents/skills/pipeline/sandbox/sandbox.sh <owner>/<template> <owner>/pipeline-sandbox
```

The script creates a private repo from the template, the labels, and the five issues (unlabelled). Then run `/plan`, then the runner.

| # | Issue | Expected outcome |
|---|---|---|
| 1 | Feature: add an about page | `READY`, merges |
| 2 | Bug: wrong page title | `READY`, merges |
| 3 | UI change: stack the footer links on mobile | `READY`, runs the `ui` review, merges |
| 4 | Fix: change the greeting while a test asserts the old text | Builder changes the test and says why in the PR, or escalates. Never edits it silently |
| 5 | Vague: "make it nicer" | `NEEDS-INFO`, never built |

Delete the repo when done.
