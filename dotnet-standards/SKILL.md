---
name: dotnet-standards
description: Write or review C# and ASP.NET Core code with nullable types, async all the way, injected dependencies, minimal API endpoints and EF Core. Use for .NET implementation, refactoring, or code review.
---

# .NET code standards

For C# on .NET 10 with ASP.NET Core minimal APIs and EF Core. Project layout and the abstractions to avoid (generic repositories, MediatR, CQRS) live in project-starter's `tech-stack.md`, under Backend architecture. The repo's `.editorconfig` and `dotnet format` own formatting.

## Types and nullability

- Nullable reference types on, with nullable warnings as errors (`<WarningsAsErrors>nullable</WarningsAsErrors>` in `Directory.Build.props`).
- No `!` null-forgiving operator unless the compiler can't see a guarantee, and then with a comment saying why.
- `sealed record` for requests, responses, DTOs and value objects. Classes for entities and services, sealed by default.
- `required` and `init` members over constructors with long parameter lists.
- Use types to eliminate invalid states: value objects or strongly typed IDs where mixing them up is costly (money, IDs of different entities).
- Money is `decimal` with its currency, never `double`.
- Time comes from an injected `TimeProvider`, never `DateTime.Now`. Store `DateTimeOffset` in UTC.

## Async

- Async all the way down. No `.Result`, `.Wait()` or `GetAwaiter().GetResult()`.
- Accept a `CancellationToken` in every async method and pass it through, from the endpoint to EF Core.
- No `async void` outside event handlers, and no `Task.Run` in request paths.

## Control flow and errors

- Guard clauses at the top (`ArgumentNullException.ThrowIfNull`), happy path at the bottom. No `else` after a `return`.
- Expected outcomes (not found, invalid input, conflict) are return values, not exceptions.
- Unhandled exceptions become ProblemDetails via `AddProblemDetails()` and `UseExceptionHandler()`. Never leak stack traces.
- Catch `Exception` only in that top-level handler.

## Endpoints

- One `Map{Feature}Endpoints` extension per feature, using `MapGroup`.
- Return `TypedResults` so responses are compile-checked and appear in OpenAPI.
- Bind request records, never entities. Return response records, never entities.
- Validate at the boundary with the built-in minimal API validation (`builder.Services.AddValidation()`) and DataAnnotations. Ask before adding a validation library.
- Deny by default with a fallback authorisation policy, then open endpoints explicitly. Authorise with named policies.

## Dependency injection

- Constructor injection with primary constructors. No service locator (`IServiceProvider.GetService` in app code).
- Config through the options pattern, failing at startup when it's missing: `AddOptions<T>().BindConfiguration("Section").ValidateDataAnnotations().ValidateOnStart()`.
- Respect lifetimes: `DbContext` is scoped, and singletons never capture scoped services.
- HTTP calls through `IHttpClientFactory` or typed clients, never `new HttpClient()`.
- One interface per external boundary (payments, email, third-party APIs). Don't add interfaces for internal classes with a single implementation.

## EF Core

- `DbContext` is the unit of work and the repository. Don't wrap it in a generic repository.
- Reads use `AsNoTracking()` and project with `Select` into response records.
- No lazy loading. Load related data with projections or `Include`, and watch for N+1 queries.
- Every list query is paginated.
- Raw SQL only through parameterised `FromSql` or Dapper parameters, never string concatenation.
- One `IEntityTypeConfiguration<T>` per entity. Migrations follow tech-stack.md, under Migrations.

## Logging

- `ILogger<T>` with message templates: `logger.LogInformation("Order {OrderId} paid", orderId)`, never string interpolation.
- No secrets or personal data in logs.

## Naming and style

- .NET conventions: PascalCase for types and members, camelCase for locals and parameters, `_camelCase` for private fields, an `Async` suffix on async methods.
- File-scoped namespaces, one type per file.
- No abbreviations. Units in names where relevant (`timeoutMs`). Magic values become named constants.
- `var` when the type is obvious from the right-hand side.
- Comments only for a non-obvious *why*. XML docs on public APIs only.

## Tests

- Tools are in tech-stack.md, under Testing (xUnit, `WebApplicationFactory`, Testcontainers).
- Test through HTTP endpoints at the agreed seams (see the tdd skill), against real Postgres.
- Control time with `FakeTimeProvider` from `Microsoft.Extensions.TimeProvider.Testing`.
