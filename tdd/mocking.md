# When to Mock

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes - prefer test DB)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

## Designing for mockability

Inject boundary dependencies and give each external service one narrow, SDK-style interface. The patterns and examples live in [codebase-design](../codebase-design/SKILL.md) (Designing for testability); TypeScript specifics in [typescript-standards](../typescript-standards/SKILL.md).
