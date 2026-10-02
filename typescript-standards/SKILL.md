---
name: typescript-standards
description: Write or review TypeScript with strict types, clear control flow, dependency injection, and focused modules. Use for TypeScript implementation, refactoring, or code review.
---

# TypeScript code standards

## Type safety

- No `any`. Use `unknown`, proper interfaces, or generics instead.
- No enums. Use `as const` objects with a type helper that derives a union type.
- Strict mode always: no `@ts-ignore`, no `@ts-expect-error`.
- Never call a `@deprecated` symbol. Use the replacement its JSDoc names.
- Prefer `interface` over `type` for object shapes.
- Type every function's parameters and return type explicitly.
- Define interfaces for external dependencies (databases, APIs, file systems, third-party libraries). Never depend on concrete implementations directly.
- Use types to eliminate invalid states. Don't use -1 or null with a comment explaining what it means: use `T | undefined`, union types, or tagged unions so the compiler enforces it.
- Use `map`, `filter`, `find`, `some`, `every` and `flatMap` for collection work. Chained methods read like a description of the transformation; manual loops don't.

## Functions

- Treat ~50 lines as a rough limit. Readability matters more than line counting.
- Extract helpers around meaningful responsibilities, not merely to shorten a function. Keep straightforward steps together when extra indirection would make the flow harder to read.
- Each function does one thing.
- Accept dependencies as parameters. A function receives what it needs rather than constructing or importing it.
- Use factory functions when dependency selection depends on runtime context (user config, environment, file type).

## React hooks

- A hook that returns state and actions gets a named interface for its return type.
- Define nontrivial actions as named functions inside the hook and return a compact object (`return { select, reset }`). Don't bury control flow in returned object methods.
- Each action reads top to bottom: resolve current state, validate, persist, then publish success. For durable state, publish only after the save succeeds, and keep pending feedback separate from success.

## Control flow

- Early returns: guard clauses at the top, happy path at the bottom.
- No nested if/else chains. Invert conditions and return early.
- No `else` after a `return`.
- No if/else chains for selecting implementations. Use an interface with multiple implementations and inject the right one.

## Naming

- Don't abbreviate: `userMessage`, not `usrMsg`.
- Add units where relevant (`timeoutMs`, `fileSizeBytes`).
- Extract magic values into named constants: `status === MESSAGE_SENT`, not `status === 5`.
- Name complex conditions: `const isEligibleForDiscount = ...` or an `isEligibleForDiscount()` function.
- Pass named values, not compound expressions, as boolean arguments.

## Style

- `const` by default, `let` only when mutation is required. Never `var`.
- Destructure parameters and objects.
- Named exports only. Default exports only where a framework requires them (Next.js `page.tsx`, `layout.tsx`, `route.ts`, config files).
- No `utils` bundles. Put each helper in the module it belongs to, or a new focused one.

## Comments

- Comments only for a non-obvious *why* (constraints, workarounds, performance hacks, links to the algorithm or paper implemented). If code needs explaining, rename or extract until it doesn't.
- Document public interfaces with JSDoc: expected behaviour and error conditions, not internals.

## Dependency injection

- Pass dependencies in through constructors or parameters rather than reaching for global imports.
- Wrap each third-party library or external service behind one interface of your own.
- Compose at the entry point: wire all dependencies in one place (factory or main).
- An implementation never references the code that injects it.
- Inject fakes in tests. If testing needs hacks around private state or mocked imports, extract and inject instead.
- Interfaces are driven by the consumer: define what the caller needs, not what the dependency happens to offer.
