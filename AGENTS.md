# XForge Agent Guide

This repo follows the XForge architecture contract. When instructions conflict with implementation drift, update the implementation to match the architecture.

## Stupid agent behaviors — do not do these

These are documented so agents stop repeating the same mistakes. This is **behavior guidance**, not a file-lock system.

1. **Touching our workspace framework for the wrong reason** — do not edit `packages/ui/src/components/compose/workspace/**` to fix Theme Studio, Storybook, branding previews, or visual polish. That layer is ours. Fix at app wiring or preview layer first.
2. **Skipping the answer** — if we ask yes/no or advice, answer in text before writing code.
3. **Over-scoping** — a layout/visual request is not permission to refactor shared compose, surfaces, typography, memory lane, or defaults.
4. **Destructive git on WIP** — no `git restore`, `git checkout --`, or `git clean` on our untracked work unless we explicitly say so.

See `.cursor/rules/` for the same guardrails.

## Our workspace framework

**Human-owned.** Agents ask before changing `packages/ui/src/components/compose/workspace/**`.

### Allowed layers for UI / visual / Storybook work

| Layer | Path |
|-------|------|
| App workspace wiring | `apps/app/app/_components/workspace/` |
| Authenticated shell wiring | `apps/app/app/_components/authenticated-*.tsx` |
| Theme Studio previews | `apps/app/app/theme-studio/` |
| Storybook | `apps/storybook/` |
| Entity/metadata surfaces | App routes + `@repo/metadata-ui` (see wiring plan) |

### Mandatory agent behavior

1. **Answer the question first** — advice and yes/no questions get a direct answer before any code.
2. **Smallest layer** — never "fix" previews by refactoring `@repo/ui` workspace compose.
3. **No destructive git on WIP** — do not `git restore`, `git checkout --`, or `git clean` on user untracked work without explicit instruction.
4. **Ask before framework edits** — *"This requires changing `<file>` in workspace compose. Approve?"*

See also: `.cursor/rules/agent-discipline.mdc`, `.cursor/rules/ui-layer-ownership.mdc`.

## Source Of Truth

- `skills/reference/architecture.md` defines system governance, dependency direction, tenant/company rules, execution, audit, permissions, and metadata limits.
- `skills/reference/packages.md` defines package ownership, public entry points, and feature package shape.
- `skills/reference/customization.md` defines what can be safely customized without breaking governance.
- `skills/reference/setup.md` defines setup and workspace expectations.

## Feature Package Surface

Standard feature public entry points are:

- `src/index.ts`
- `src/contract.ts`
- `src/schema.ts`
- `src/metadata.ts`
- `src/server.ts`
- `src/manifest.ts`

Implementation files such as `actions.ts`, `queries.ts`, projector modules, repository adapters, tests, and feature-local helper modules stay internal unless the package deliberately publishes them.

Do not export hollow `shared/` or `execution/` folders just to satisfy a scaffold. Use a single internal file when the boundary is small, and promote to a directory only when it contains real submodules.

## Dependency Rules

- Apps and orchestration code call feature behavior through package root or `/server`.
- Client code may use pure `/contract`, `/manifest`, and `/metadata` surfaces only.
- Feature packages must not import sibling feature packages or another feature package's internals.
- `packages/shared` owns narrow primitives only. It must not own business decisions, permissions, workflow, persistence, or audit.
- `packages/customization` owns governed presentation overlays only. It must not change permissions, tenant/company enforcement, audit, execution, or business rules.
- `packages/execution` owns the canonical mutation lifecycle.
- `packages/audit` owns audit event shape and persistence. Audit is not logging.
- `packages/storage` owns object/file storage only. Feature business records should use feature repositories backed by `packages/database`, not `storage.ts`.

## Runtime Rules

Mutations must follow the governed execution order:

1. authenticate actor
2. resolve tenant
3. verify tenant membership
4. resolve company when applicable
5. verify company grant when applicable
6. validate input
7. enforce permission
8. execute domain operation
9. write audit event
10. run post-commit effects only after success

Sensitive reads must validate input, enforce tenant/company scope, enforce permission, and fail closed for sensitive fields.

## Metadata Rules

Metadata and manifests are declarative. They may describe labels, navigation, fields, filters, capabilities, dashboards, ownership, integrations, and governance declarations. They must not contain business execution logic or permission finality.

## Tooling Gates

Run the narrowest relevant command first, then widen if needed:

- `pnpm --filter <package-name> typecheck`
- `pnpm --filter <package-name> test`
- `pnpm --filter <package-name> lint`
- `pnpm lint:biome`
- `pnpm lint:architecture`
- `pnpm check`

Biome guards style and import restrictions. `tools/check-architecture-boundaries.mjs` guards architecture rules that Biome cannot express reliably.

## Change Discipline

- Prefer existing package patterns over new abstractions.
- Keep public package exports explicit.
- Do not add UI for a domain package unless the package pattern requires UI.
- Do not weaken security to make tests pass.
- When a feature is still scaffold-backed, state that clearly and keep the boundary prepared for real persistence, audit, and execution integration.
