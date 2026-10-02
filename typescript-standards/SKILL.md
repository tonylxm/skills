---
name: typescript-standards
description: Write or review TypeScript with strict types, clear control flow, dependency injection, and focused modules. Use for TypeScript implementation, refactoring, or code review.
---

# TypeScript code standards

## Type safety

- NEVER use any — use unknown, proper interfaces, or generics instead
- NEVER use enums - use plain `as const` objects with a type helper into a union type
- Strict mode always — no @ts-ignore, no @ts-expect-error
- Never call a `@deprecated` symbol. Use the replacement its JSDoc names
- Prefer interface over type for object shapes
- All function parameters and return types must be explicitly typed
- Define interfaces for external dependencies (databases, APIs, file systems, third-party
  libraries) — never depend on concrete implementations directly
- Use types to eliminate invalid states — don't use -1 or null with a comment explaining what it
  means. Use T | undefined, union types, or tagged unions so the compiler enforces correctness
  instead of a comment.
- Use map, filter, find, some, every, flatMap for all collection work.
- Prefer chained methods over manual loops - they read like a description of the transformation.

## Functions

- Treat ~50 lines as a rough function limit. Readability matters more than line counting.
- Extract helpers around meaningful responsibilities, not merely to shorten a function.
  Keep straightforward steps together when extra indirection would make the flow harder to read.
- Each function does ONE thing
- Accept dependencies as parameters — functions should receive what they need, not construct or
  import it themselves
- Use factory functions when dependency selection depends on runtime context (user config,
  environment, file type, etc.)

## Hooks and returned actions

- Give hooks that return state and actions a named interface instead of an inline object
  return type. Keep each action's parameters and return type explicit.
- Define nontrivial actions as named functions inside the hook, then return a compact
  object such as `return { failure, select }`. Avoid burying control flow inside returned
  object methods.
- Keep each action readable from top to bottom: resolve current state, validate the action,
  persist the change, then publish success. For durable local state, publish the committed
  state only after the required save succeeds. Keep pending feedback separate from success.
- Name meaningful intermediate values and decisions, such as `currentSession`,
  `nextSession`, `selectionLocked`, and `selectionChanged`. Avoid compound expressions
  passed directly as boolean arguments when a name would explain their purpose.
- Destructure dependencies and repeatedly used identifiers near the top of the hook.
  Use descriptive aliases where needed, such as `id: sessionId`.

## Control flow

- Early returns only — guard clause at the top, happy path at the bottom
- No nested if/else chains — invert conditions and return early
- No else after a return
- No if/else chains for selecting implementations — use an interface with multiple implementations
  and inject the right one

## Naming

- NEVER abbreviate variable names. userMessage not usrMsg.
- Use units only where relevant (timeoutMs, fileSizeBytes)
- Extract magic values into named constants — if (status === MESSAGE_SENT) not if (status === 5)
- Complex conditions become named variables or functions — if a condition needs explanation, give
  it a name: const isEligibleForDiscount = ... or extract to isEligibleForDiscount()
- Code should read like prose — if you feel the urge to add a comment, rename things until the
  code says it itself

## Style

- const by default, let only when mutation is required. Never var.
- Destructure parameters and objects
- Named exports only — no default exports (except route files for Express)
- NEVER make bundles of utils. Sort them into their own relevant modules / move into relevant
  class / make a new class if needed.

## Comments

- Don't write comments — improve the code instead
- If a condition is complex enough to need a comment, extract it into a named variable or function
- If a value needs a comment to explain what it represents, make it a named constant or a type
- Exceptions: performance hacks that would look wrong without context, links to algorithms or
  papers the code implements
- API documentation is not a comment — document public interfaces, expected behavior, and error
  conditions with JSDoc. This describes how to use the code, not how it works internally.

## Dependency injection

- Constructor/parameter injection over global imports — pass dependencies in, don't reach out for
  them
- One interface per external boundary — wrap third-party libraries and external services behind
  your own interfaces
- Composition at the entry point — wire up all dependencies in one place (factory or main), not
  scattered across the codebase
- No dependency knows who uses it — implementations should never reference the code that injects
  them
- Inject fakes in tests — if testing requires hacking around private state or mocking imports,
  that's a signal to extract and inject instead
- Interfaces should be driven by the consumer, not the implementation — define what the caller
  needs, not what the dependency happens to offer

## Commits and pull requests

- One logical change per commit, the same rule as functions, applied to diffs
- Scaffold before you implement, land the interface, type, or stub first; the body comes next
- A diff should be reviewable in a single sitting — if it isn't, split it
- Refactor commits never contain logic changes, and vice versa