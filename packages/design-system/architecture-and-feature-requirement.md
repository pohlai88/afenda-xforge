# Design System Architecture

## Business Definition

**Design System Architecture is the XForge package capability that defines typed design vocabulary, tokens, variants, and shared visual contracts used by higher-level UI packages without owning React rendering, application logic, or metadata authority.**

---

# Design System Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Typed Design Contracts** | Sizes, density, tones, radii, chart vocabulary, font contracts, and shared variant schemas |
| **Token Registries** | Color, typography, motion, shadow, radius, density, and theme token definitions |
| **Variant Registries** | Canonical button, badge, card, form, and table variant contracts |
| **Generated Assets** | Generated CSS and adapter outputs that formalize package-owned visual vocabulary |
| **Public Package Surface** | Explicit exports for contracts, tokens, and variants |

---

# Design System Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| React rendering primitives | `@repo/ui` |
| Metadata-driven rendering | `@repo/metadata-ui` |
| Declarative business metadata | `@repo/metadata` |
| Application business logic and workflow authority | Feature and runtime packages |
| Theme provider runtime wiring | UI and app layers |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Design vocabulary and token names | `@repo/design-system` | This package owns the typed visual language used by downstream UI surfaces. |
| React component behavior | `@repo/ui` | Design-system provides contracts only, not rendering implementations. |
| Metadata display semantics | `@repo/metadata` and `@repo/metadata-ui` | This package may be referenced by downstream contracts but does not own metadata orchestration. |
| Business authority | Feature and runtime packages | Visual tokens must never become business-rule carriers. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Package boundary | `@repo/design-system` must remain free of `@repo/ui`, `@repo/metadata`, `@repo/metadata-ui`, and runtime/business package dependencies. |
| Runtime boundary | The package may expose generated assets and typed contracts but must not own application runtime execution. |
| Authority boundary | Visual contracts must not encode permission finality, workflow authority, or data mutation semantics. |
| API boundary | Consumers import tokens and contracts through explicit package exports only. |
| Generation boundary | Generated CSS or adapter assets must remain derived from typed design-system sources. |

---

# Design System Architecture Requirement Statement

| Requirement | Description |
| --- | --- |
| **Design System Architecture** | Provides typed, reusable visual vocabulary for XForge through design contracts, token registries, variants, and generated assets while remaining independent from React rendering and business logic. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **DS-001** | System shall expose explicit contracts for shared design vocabulary, component sizing, density, status tone, and theme presets. |
| **DS-002** | System shall expose canonical token registries for colors, typography, motion, shadow, radius, density, and theme values. |
| **DS-003** | System shall expose reusable variant registries for shared component families. |
| **DS-004** | System shall keep package dependencies limited to contract and validation concerns. |
| **DS-005** | System shall support generated assets derived from package-owned token sources. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Consumers can import typed design contracts, tokens, and variants through explicit package subpaths. |
| 2 | Package code does not depend on UI rendering packages or business runtime packages. |
| 3 | Canonical token registries exist for the package-owned visual vocabulary. |
| 4 | Generated package assets remain derived from typed source definitions. |
| 5 | Variant and token contracts remain testable without app runtime dependencies. |

---

# Definition of Done

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The package remains contract-first and dependency-light, without taking on rendering or business responsibilities. |
| Public surface | Exports for contracts, tokens, and variants are explicit and stable. |
| Generation and validation | Generated assets and registries remain derived from typed package sources and stay consistent with tests. |
| Tests and verification | `pnpm --filter @repo/design-system lint`, `pnpm --filter @repo/design-system typecheck`, and `pnpm --filter @repo/design-system test` pass. |
| Documentation | This document and package README reflect the actual visual-vocabulary role of the package. |

---

# Implementation Status

**Status:** Implemented

**Last audited:** 2026-06-10

This package already contains contracts, tokens, variants, generated CSS, scripts, and focused tests. This document standardizes the package boundary and merged completion criteria into one source-of-truth document.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contracts`](./src/contracts), [`src/contracts/registry.schema.ts`](./src/contracts/registry.schema.ts) |
| Authorization and policy boundary | Implemented by exclusion | [`package.json`](./package.json), [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Source-of-truth integration | Implemented for token ownership | [`src/tokens`](./src/tokens), [`src/variants`](./src/variants) |
| Repository and persistence | Not applicable by design | [`package.json`](./package.json) |
| Queries, projections, or read models | Not applicable by design | [`src/index.ts`](./src/index.ts) |
| Actions, workflows, or mutations | Not applicable by design | [`src/adapters/type2-css.adapter.ts`](./src/adapters/type2-css.adapter.ts) |
| HTTP or API routes | Not applicable by design | [`package.json`](./package.json) |
| Requirement coverage registry | Not implemented as a dedicated registry file | [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Verification tests | Implemented | [`src/tests/design-system.test.ts`](./src/tests/design-system.test.ts), [`src/tests/token-contract.test.ts`](./src/tests/token-contract.test.ts), [`src/tests/variant-contract.test.ts`](./src/tests/variant-contract.test.ts) |

### Planning Mark

- `Current audited slices: DS-001, DS-002, DS-003, DS-004, DS-005`
- `Slice status: implemented`
- `Feature status: implemented as a contract and token package`

---

# Requirement Coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| DS-001 | Implemented | [`src/contracts`](./src/contracts), [`src/index.ts`](./src/index.ts) |
| DS-002 | Implemented | [`src/tokens`](./src/tokens), [`src/tests/token-contract.test.ts`](./src/tests/token-contract.test.ts) |
| DS-003 | Implemented | [`src/variants`](./src/variants), [`src/tests/variant-contract.test.ts`](./src/tests/variant-contract.test.ts) |
| DS-004 | Implemented | [`package.json`](./package.json) |
| DS-005 | Implemented | [`scripts/generate-type2-css.mts`](./scripts/generate-type2-css.mts), [`src/generated/type2.css`](./src/generated/type2.css), [`src/tests/type2-css.test.ts`](./src/tests/type2-css.test.ts) |

---

# Element-by-Element Code Evaluation

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Contract Surface | Implemented. The package exports typed design contracts for shared visual vocabulary. | [`src/contracts`](./src/contracts), [`src/index.ts`](./src/index.ts) | Keep contracts independent from rendering packages. |
| Token Registry | Implemented. Tokens cover color, typography, motion, shadow, radius, density, and theme concepts. | [`src/tokens`](./src/tokens) | Extend tokens through typed registries rather than app-local one-offs. |
| Variant Registry | Implemented. Shared component family variants are formalized in package-owned variant files. | [`src/variants`](./src/variants) | Keep variant meaning visual, not business-authoritative. |

---

# Verification Summary

1. `pnpm --filter @repo/design-system lint`
2. `pnpm --filter @repo/design-system typecheck`
3. `pnpm --filter @repo/design-system test`

These commands define package verification. They were not re-run as part of this documentation standardization pass.

---

# Audience

This document is for engineers defining or consuming XForge design vocabulary, tokens, and variant contracts.

---

# Decision Enabled

Use this document to decide whether a visual concern belongs in `@repo/design-system`, `@repo/ui`, `@repo/metadata`, or `@repo/metadata-ui`.

---

# Source Of Truth References

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
