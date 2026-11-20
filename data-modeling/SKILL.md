---
name: data-modeling
description: Use when designing or changing a database schema (adding a table or column, keys, constraints, indexes, relationships), writing a migration, designing multi-row transactions or idempotent writes, or reviewing queries for correctness and performance.
---

# Data modeling

Stack-agnostic rules for relational schemas, written with Postgres in mind. Stack choices (Neon, Drizzle, RLS, migration workflow) live in [project-starter/tech-stack.md](../project-starter/tech-stack.md). Terms for the domain come from `docs/GLOSSARY.md` (see domain-modeling).

Deeper Postgres reference (RLS, locking, pooling, EXPLAIN, extensions): Supabase's MIT-licensed [supabase-postgres-best-practices](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices). Read its rule files on demand. It is not vendored here, so check the source rather than trusting memory of it.

The database is the last line of defence. Application code is the second net, never the only one.

## Rules

| Area | Rule |
|---|---|
| Keys | Every table has a surrogate primary key (identity bigint, or uuid v7 when ids are exposed or generated client-side). Natural uniqueness (email, slug, external id) is a `UNIQUE` constraint, not the key. |
| Nullability | `NOT NULL` by default. A nullable column needs a reason that is stated in the schema or migration. |
| Relationships | Every relationship is a foreign key. Choose `ON DELETE` on purpose (`RESTRICT` by default, `CASCADE` only for owned children). |
| Constraints | State invariants as `CHECK` and `UNIQUE` (positive amounts, valid state values, one active row per user). Closed sets are a `CHECK` or a lookup table, chosen by whether they change without a deploy. |
| Types | `timestamptz` for moments, `date` for calendar days. Money as integer minor units or `numeric`, never float. `text` over `varchar(n)` unless a length is a real rule. |
| Normalization | Third normal form by default. Denormalize only for a measured problem, name the source of truth, and keep the copy in sync in one place. |
| Indexes | Index every foreign key and every column in a hot `WHERE`, `JOIN` or `ORDER BY`. Composite order is equality columns first, then range or sort. Confirm with `EXPLAIN`; remove indexes nothing uses. |
| Transactions | Wrap each multi-row invariant in one transaction. Keep it short and do no network calls inside it. |
| Concurrency | Concurrent edits use optimistic locking (a version column or `updated_at` check) or an explicit row lock. Last write wins is a decision, not a default. |
| Idempotency | An operation with an external effect (payment, email, webhook) records an idempotency key in a table with a `UNIQUE` constraint, written in the same transaction as the state change. |
| Deletion | Hard delete by default. Soft delete (`deleted_at`) only for a stated recovery or audit need, and then every query and unique index accounts for it. |
| Audit | `created_at` and `updated_at` on mutable tables. History needed for compliance goes in an append-only table, not overwritten rows. |
| Migrations | One concern per migration, reviewed as SQL. Breaking changes are expand and contract (see tech-stack Migrations). |

## Queries

- Load related data in one query or a batch, never in a loop (N+1).
- Select the columns you need. No `SELECT *` in application code.
- Paginate with keyset (`WHERE id > $last ORDER BY id LIMIT n`) for large or growing tables. Offset only for small, bounded lists.
- Authorization filters belong in the query (and RLS where used), not in a post-filter of fetched rows.

## Refuse

- Entity-attribute-value tables.
- JSON columns for fields that are filtered, joined or constrained. JSON is for opaque payloads.
- Polymorphic foreign keys (`owner_type` + `owner_id`). Use one nullable FK per target with a `CHECK` that exactly one is set, or separate tables.
- Enums or status strings with no `CHECK`, so any value can be written.
- Business rules living only in application code with no constraint behind them.
- Business logic in triggers, unless the brief asks for it.
- Storing derived values (counts, totals) without a rule for keeping them correct.
- Editing an applied migration. Add a new one.

## Verify

- Every FK has an index, and `EXPLAIN` on the main queries shows no sequential scan on a large table.
- A test or script tries to violate each key invariant (duplicate, null, orphan, negative amount) and the database rejects it.
- The migration runs on a copy of realistic data and the previous code still works against the new schema.
- Retrying the same external-effect operation twice changes state once.

## Growing this list

Add a rule only after it recurs across projects. One line each, stated as the rule. Edit in `~/.agents/skills`.
