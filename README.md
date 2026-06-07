# XForge

XForge is a governance-first ERP monorepo for building tenant-scoped business systems with explicit company grants, canonical execution, and auditable mutations.

## What It Is

- `pnpm` workspace
- Turborepo monorepo
- Next.js App Router foundation
- PostgreSQL 16 with Drizzle ORM
- managed auth and infrastructure at package boundaries
- master-data as the first-class feature family

## Docs

- [Framework adoption](./skills/reference/framework.md)
- [Architecture](./skills/reference/architecture.md)
- [Packages](./skills/reference/packages.md)
- [Customization](./skills/reference/customization.md)
- [Setup](./skills/reference/setup.md)

## Baseline Rules

- tenant isolation is mandatory
- company grants are explicit
- writes go through the canonical execution pipeline
- sensitive reads go through the canonical query pipeline
- feature packages do not cross-import each other
- `packages/shared` stays narrow and boring

## Local Setup

See [`skills/reference/setup.md`](./skills/reference/setup.md) for the bootstrap and environment contract.

## Generators

- `pnpm gen` for a generic workspace package
- `pnpm gen:app` for a Next.js app scaffold
- `pnpm gen:feature` for a master-data feature scaffold
