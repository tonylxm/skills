# Agent evals

Read when the change affects AI or agent behaviour: prompts, tool definitions, model choice, agent loops, retrieval. Unit tests still cover the deterministic code around the model; evals cover what the model does.

## What to evaluate
| Dimension | Question |
|---|---|
| Goal achievement | Did the run reach the user's goal? |
| Correctness | Is the final answer or state right? |
| Tool selection | Did it call the right tools, and avoid the wrong ones? |
| Tool parameters | Were arguments valid and scoped (ids, amounts, tenants)? |
| State transitions | Did records move only through allowed states? |
| Authorization and safety | Did it refuse or stop where it must, and never cross a user or tenant boundary? |
| Robustness | Does it survive bad input, tool errors, timeouts and prompt injection in tool output? |
| Cost and latency | Tokens, tool calls and time within budget, where they matter |

## Rules
- **Grade outcomes, not paths.** When several tool sequences are valid, assert on the end state and the invariants, not one exact trace. Assert on the path only where order matters (auth before write, confirm before pay).
- **Small fixed case set.** 10 to 30 cases from real requests and past failures, each with an expected outcome. Every escaped bug becomes a case.
- **Deterministic checks first.** Assert on state, tool calls and structured output. Use an LLM judge only for qualities code can't check, with a written rubric.
- **Run on every prompt, tool or model change,** and compare pass rate, cost and latency with the last run. Models are non-deterministic: run flaky cases several times and track the rate.
- Mock external side effects (payments, email) and keep the model call real.
