# UI Architecture

## Business Definition

**UI Architecture is the XForge presentational package capability that exposes reusable React primitives, composed UI patterns, shared style assets, and app-facing component exports without owning metadata rendering, business rules, or runtime authority.**

---

# UI Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Presentational Primitives** | Reusable shadcn-style controls, input elements, tables, cards, dialogs, and shared component building blocks |
| **Composed Patterns** | Higher-level composed component examples and registries under the `compose` surface |
| **Theme And Style Assets** | Shared package-local styles, fonts, and CSS utilities used by UI components |
| **UI Utilities** | Local hooks and helper utilities that support client-safe presentational behavior |
| **App-Facing Exports** | Explicit package subpath exports for components, styles, providers, and utility types |

---

# UI Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Database access and persistence | Data and infrastructure packages |
| Authentication and permission finality | Auth and permissions layers |
| Business execution and mutation workflows | Feature packages and execution pipeline |
| Metadata-driven rendering authority | `@repo/metadata-ui` |
| Global application bootstrap and routing | App layers |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Primitive component behavior | `@repo/ui` | This package owns presentational implementation details for exported primitives. |
| Shared visual vocabulary | `@repo/ui` and upstream design conventions | This package may consume style contracts, but it does not own cross-package business semantics. |
| Metadata-to-UI rendering decisions | `@repo/metadata-ui` | UI supplies components; metadata-ui decides how metadata maps to rendered surfaces. |
| Business state and authority | Consuming apps and feature packages | UI must remain display-only and must not become an authority layer. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | Components may display tenant-scoped data passed to them, but they must not resolve tenant authority themselves. |
| Permission boundary | UI may hide or disable controls for usability, but server-side permission re-checks remain mandatory outside this package. |
| API boundary | The package must not call business APIs or own route integration logic. |
| Runtime boundary | Runtime authority, secrets, and data-layer side effects must stay outside this package. |
| Package boundary | `@repo/ui` must not depend on database, auth, execution, metadata authority, or feature internals. |

---

# UI Architecture Requirement Statement

| Requirement | Description |
| --- | --- |
| **UI Architecture** | Provides reusable presentational React components, composed UI patterns, and app-facing exports for XForge while remaining free of metadata authority, server-side business logic, and data-layer responsibilities. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **UI-001** | System shall expose explicit package exports for shared presentational components and style assets. |
| **UI-002** | System shall keep presentational components independent from database, auth, execution, and feature-internal dependencies. |
| **UI-003** | System shall provide reusable primitives and higher-level composed patterns through stable package paths. |
| **UI-004** | System shall keep package-local utilities and hooks limited to client-safe UI concerns. |
| **UI-005** | System shall preserve package-local styles, fonts, and providers required by exported UI components. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Consumers can import shared primitives and providers from explicit `@repo/ui` package paths. |
| 2 | Presentational code does not import database, auth, execution, or feature-internal modules. |
| 3 | Composed UI examples and registries are available through package-owned compose surfaces. |
| 4 | Shared fonts, styles, and utility helpers remain package-local and reusable by consuming apps. |
| 5 | UI behaviors stay display-focused and do not become business-authority entrypoints. |

---

# Definition of Done

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The package remains presentational and does not absorb data, auth, permission, metadata-authority, or execution responsibilities. |
| Public surface | Export paths for components, providers, styles, and types are explicit and stable. |
| Runtime behavior | Hooks and helpers stay client-safe and limited to UI concerns. |
| Tests and verification | `pnpm --filter @repo/ui lint` and `pnpm --filter @repo/ui typecheck` pass, and any changed public surface compiles for consumers. |
| Documentation | This document and package-level usage notes reflect the actual component and export boundaries. |

---

# Implementation Status

**Status:** Implemented

**Last audited:** 2026-06-10

This package already contains a large presentational surface of primitives and composed examples. This document standardizes the package boundary and completion bar; verification commands were not re-run in this pass.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Partial: component contracts and types only | [`src/types.ts`](./src/types.ts), [`src/components/compose/compose.contract.ts`](./src/components/compose/compose.contract.ts) |
| Authorization and policy boundary | Implemented by exclusion | [`package.json`](./package.json), [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Source-of-truth integration | Not applicable beyond presentational inputs | [`src/components`](./src/components) |
| Repository and persistence | Not applicable by design | [`package.json`](./package.json) |
| Queries, projections, or read models | Not applicable by design | [`src/components`](./src/components) |
| Actions, workflows, or mutations | Not owned by this package | [`src/components/ui-shadcn`](./src/components/ui-shadcn) |
| HTTP or API routes | Not applicable by design | [`package.json`](./package.json) |
| Requirement coverage registry | Not implemented as a dedicated registry file | [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Verification tests | Partial: no package-local test script | [`package.json`](./package.json), [`examples/purpose-variants.example.tsx`](./examples/purpose-variants.example.tsx) |

### Planning Mark

- `Current audited slices: UI-001, UI-002, UI-003, UI-004, UI-005`
- `Slice status: implemented for package boundary and exports`
- `Feature status: implemented as a presentational package`

---

# Requirement Coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| UI-001 | Implemented | [`package.json`](./package.json), [`src/index.ts`](./src/index.ts) |
| UI-002 | Implemented | [`package.json`](./package.json), [`src/lib`](./src/lib) |
| UI-003 | Implemented | [`src/components/index.ts`](./src/components/index.ts), [`src/components/compose/index.ts`](./src/components/compose/index.ts), [`src/components/ui-shadcn`](./src/components/ui-shadcn) |
| UI-004 | Implemented | [`src/hooks/use-mobile.ts`](./src/hooks/use-mobile.ts), [`src/hooks/use-file-upload.ts`](./src/hooks/use-file-upload.ts), [`src/lib/utils.ts`](./src/lib/utils.ts) |
| UI-005 | Implemented | [`src/styles/globals.css`](./src/styles/globals.css), [`src/lib/fonts.ts`](./src/lib/fonts.ts), [`src/components/ui-shadcn/theme-provider.tsx`](./src/components/ui-shadcn/theme-provider.tsx) |

---

# Element-by-Element Code Evaluation

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Presentational Primitive Surface | Implemented. The package exports a broad set of primitives through `ui-shadcn` and root component surfaces. | [`src/components/ui-shadcn`](./src/components/ui-shadcn), [`src/components/index.ts`](./src/components/index.ts) | Keep primitives app-facing and free of business authority. |
| Compose Catalog | Implemented. Higher-level composed patterns and registries exist under the compose surface. | [`src/components/compose/index.ts`](./src/components/compose/index.ts), [`src/components/compose/compose.registry.ts`](./src/components/compose/compose.registry.ts) | Preserve registry-driven composition without pulling feature workflow logic into the package. |
| Style And Provider Assets | Implemented. Package-local globals, theme provider, and fonts support exported components. | [`src/styles/globals.css`](./src/styles/globals.css), [`src/lib/fonts.ts`](./src/lib/fonts.ts), [`src/components/ui-shadcn/theme-provider.tsx`](./src/components/ui-shadcn/theme-provider.tsx) | Keep visual infrastructure local to the package and reusable by apps. |

---

# Verification Summary

1. `pnpm --filter @repo/ui lint`
2. `pnpm --filter @repo/ui typecheck`

These commands define package verification for the current UI surface. They were not re-run in this documentation standardization pass.

---

# Audience

This document is for engineers building, reviewing, or consuming shared presentational components in XForge.

---

# Decision Enabled

Use this document to decide whether a UI concern belongs in `@repo/ui`, `@repo/metadata-ui`, a feature package, or an app layer.

---

# Source Of Truth References

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
