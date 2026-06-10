# System Admin Control Plane Architecture

## Business Definition

**System Admin Control Plane Architecture is the XForge feature package capability that exposes governed tenant-scoped system administration workflows, operational views, customization review, and webhook operations orchestration without moving platform authority out of auth, permissions, execution, audit, metadata, customization, health, or metrics foundations.**

---

# System Admin Control Plane Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Admin Overview And Domains** | Tenant-scoped overview, access, audit, customization, integrations, operations, and tenant-settings domain contracts and metadata |
| **Governed Server Entry Points** | Queries, actions, server entrypoints, and execution integration for approved system administration workflows |
| **Metadata-Driven Admin Surfaces** | Package-owned metadata and manifest surfaces for control-plane rendering |
| **Customization Review** | Customization review and webhook endpoint governance within the limits defined by `@repo/customization` and related runtime layers |
| **Feature Runtime Packaging** | Explicit public subpaths for contract, schema, metadata, execution, manifest, server, and shared feature surfaces |

---

# System Admin Control Plane Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Tenant resolution authority | Auth and trusted server context layers |
| Permission finality | `@repo/permissions` |
| Audit model ownership and persistence | `@repo/audit` |
| Customization runtime ownership | `@repo/customization` |
| Health and metrics collection ownership | Health and metrics packages |
| Arbitrary tenant schema, code, or unrestricted customization | Not allowed |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| System admin feature orchestration | `@repo/features-system-admin-control-plane` | This package owns the governed admin feature surface and orchestration contracts. |
| Permission and capability finality | `@repo/permissions` | Control plane may request checks but does not own final authorization. |
| Execution and mutation authority | `@repo/execution` and owning packages | Sensitive mutations must run through canonical execution flows. |
| Audit ownership | `@repo/audit` | The package may trigger auditable operations but must not redefine audit semantics. |
| Customization governance | `@repo/customization` | The package may present and review customization, but customization ownership remains external. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | Every read and mutation must resolve actor and tenant from trusted server context. |
| Permission boundary | Sensitive actions require system-admin capability checks through approved permission layers. |
| Audit boundary | Sensitive mutations must write audit evidence through approved audit and execution flows. |
| Execution boundary | Business mutations must run through canonical execution entrypoints and not through package-local bypasses. |
| Customization boundary | Customization review and publication flows must stay within `@repo/customization` governance limits. |
| Package boundary | The package is a feature package and must not absorb foundation authority from auth, permissions, audit, customization, health, or metrics. |

---

# System Admin Control Plane Architecture Requirement Statement

| Requirement | Description |
| --- | --- |
| **System Admin Control Plane Architecture** | Provides a governed tenant-scoped system administration feature surface for XForge that orchestrates approved runtime capabilities through metadata-driven admin domains while preserving platform authority in the appropriate foundation packages. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **SACP-001** | System shall expose explicit package subpaths for contracts, schemas, metadata, manifest, execution helpers, shared surfaces, and server runtime entrypoints. |
| **SACP-002** | System shall require trusted actor and tenant context for control-plane reads and mutations. |
| **SACP-003** | System shall require approved permission checks for sensitive control-plane actions. |
| **SACP-004** | System shall execute sensitive mutations through canonical execution and audit flows. |
| **SACP-005** | System shall provide metadata-driven control-plane domains for overview, access, audit, customization, integrations, operations, and tenant settings. |
| **SACP-006** | System shall keep customization review and publication within the governance limits of `@repo/customization`. |
| **SACP-007** | System shall keep webhook operations orchestration within approved package boundaries without moving route or transport ownership into this feature package. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Consumers can import server runtime and pure metadata subpaths through explicit package exports. |
| 2 | Reads and mutations resolve trusted actor and tenant context before proceeding. |
| 3 | Sensitive actions are permission-gated through approved permission layers. |
| 4 | Sensitive mutations flow through execution and audit boundaries instead of bypassing them in feature code. |
| 5 | Metadata-driven admin domains exist for the documented control-plane surfaces. |
| 6 | Customization review remains governed by `@repo/customization` limits and does not expose arbitrary tenant override authority. |
| 7 | Webhook endpoint and operational admin surfaces stay orchestration-focused rather than transport-authoritative. |

---

# Definition of Done

This section replaces the former standalone `dod.md` for `@repo/features-system-admin-control-plane`.

| Area | Done When |
| --- | --- |
| Package and exports | The package lives under the system-admin feature family and public exports remain explicit and stable. |
| Architecture and authority | The package remains a feature/control-plane package and does not absorb authority from auth, permissions, execution, audit, metadata, customization, health, or metrics packages. |
| Runtime behavior | Server runtime entrypoints are server-only, pure metadata surfaces are importable separately, and reads and mutations respect tenant and permission boundaries. |
| Customization and governance | Customization orchestration stays within `@repo/customization` limits and never exposes arbitrary code, schema, or unrestricted tenant override behavior. |
| Tests and verification | `pnpm --filter @repo/features-system-admin-control-plane lint`, `pnpm --filter @repo/features-system-admin-control-plane typecheck`, and `pnpm --filter @repo/features-system-admin-control-plane test` pass. |
| Documentation | This document reflects package placement, authority boundaries, runtime behavior, and completion criteria in one source-of-truth file. |

---

# Implementation Status

**Status:** Partial

**Last audited:** 2026-06-10

The package already contains server entrypoints, metadata, manifest, domain-specific contracts, queries, actions, webhook endpoint surfaces, customization review helpers, and package tests. It remains partial as an evolving admin feature because some downstream foundation behavior and app-shell integration remain external by design.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts), [`src/domains`](./src/domains) |
| Authorization and policy boundary | Partial | [`src/actions.ts`](./src/actions.ts), [`src/server.ts`](./src/server.ts), [`src/execution/index.ts`](./src/execution/index.ts) |
| Source-of-truth integration | Implemented | [`src/metadata.ts`](./src/metadata.ts), [`src/manifest.ts`](./src/manifest.ts), [`src/domains`](./src/domains) |
| Repository and persistence | Partial: delegated to external packages | [`package.json`](./package.json), [`src/actions.ts`](./src/actions.ts) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts), [`src/domains/overview/queries.ts`](./src/domains/overview/queries.ts), [`src/domains/customization/queries.ts`](./src/domains/customization/queries.ts) |
| Actions, workflows, or mutations | Implemented for current feature scope | [`src/actions.ts`](./src/actions.ts), [`src/domains/access/actions.ts`](./src/domains/access/actions.ts), [`src/domains/tenant-settings/actions.ts`](./src/domains/tenant-settings/actions.ts) |
| HTTP or API routes | Not owned by this package by design | [`server.ts`](./server.ts), [`README.md`](./README.md) |
| Requirement coverage registry | Not implemented as a dedicated registry file | [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Verification tests | Implemented | [`src/tests/contract.test.ts`](./src/tests/contract.test.ts), [`src/tests/queries.test.ts`](./src/tests/queries.test.ts), [`src/tests/actions.test.ts`](./src/tests/actions.test.ts), [`src/tests/webhooks.test.ts`](./src/tests/webhooks.test.ts) |

### Planning Mark

- `Current audited slices: SACP-001, SACP-002, SACP-003, SACP-004, SACP-005, SACP-006, SACP-007`
- `Slice status: partial; current feature runtime exists, but app-shell and wider platform orchestration remain external`
- `Feature status: partially implemented as a governed admin feature package`

---

# Requirement Coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| SACP-001 | Implemented | [`package.json`](./package.json), [`src/index.ts`](./src/index.ts), [`src/server.ts`](./src/server.ts), [`src/metadata.ts`](./src/metadata.ts) |
| SACP-002 | Partial | [`src/server.ts`](./src/server.ts), [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |
| SACP-003 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/index.ts`](./src/execution/index.ts) |
| SACP-004 | Partial | [`src/execution/index.ts`](./src/execution/index.ts), [`src/actions.ts`](./src/actions.ts) |
| SACP-005 | Implemented | [`src/domains`](./src/domains), [`src/metadata.ts`](./src/metadata.ts), [`src/manifest.ts`](./src/manifest.ts) |
| SACP-006 | Implemented | [`src/customization-review.ts`](./src/customization-review.ts), [`src/domains/customization`](./src/domains/customization) |
| SACP-007 | Implemented | [`src/webhook-endpoints.ts`](./src/webhook-endpoints.ts), [`src/domains/integrations/webhook-endpoints.ts`](./src/domains/integrations/webhook-endpoints.ts) |

---

# Element-by-Element Code Evaluation

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature Runtime Surface | Implemented. The package exposes explicit contract, schema, metadata, manifest, server, and execution entrypoints. | [`package.json`](./package.json), [`src/index.ts`](./src/index.ts), [`src/server.ts`](./src/server.ts) | Preserve separation between pure metadata exports and server-only runtime surfaces. |
| Domain Composition | Implemented. Domain-specific folders cover overview, access, audit, customization, integrations, operations, and tenant settings. | [`src/domains`](./src/domains) | Add new admin surfaces through domain modules instead of flattening concerns into root files. |
| Customization Governance | Implemented. Customization review and related orchestration exist without transferring customization ownership into this feature package. | [`src/customization-review.ts`](./src/customization-review.ts), [`src/domains/customization`](./src/domains/customization) | Keep arbitrary code or schema customization out of the control plane. |
| Webhook Operations Surface | Implemented. Webhook endpoint and integration surfaces exist as admin orchestration concerns. | [`src/webhook-endpoints.ts`](./src/webhook-endpoints.ts), [`src/domains/integrations/webhook-endpoints.ts`](./src/domains/integrations/webhook-endpoints.ts) | Keep route handling and transport ownership outside this package. |

---

# Verification Summary

1. `pnpm --filter @repo/features-system-admin-control-plane lint`
2. `pnpm --filter @repo/features-system-admin-control-plane typecheck`
3. `pnpm --filter @repo/features-system-admin-control-plane test`

These commands define package verification. They were not re-run as part of this documentation standardization pass.

---

# Audience

This document is for engineers building, reviewing, or integrating tenant-scoped system administration capabilities in XForge.

---

# Decision Enabled

Use this document to decide whether a concern belongs in the system admin control plane, a foundation package, `apps/api`, or another feature owner.

---

# Source Of Truth References

- [`../../../../skills/reference/architecture.md`](../../../../skills/reference/architecture.md)
- [`../../../../skills/reference/packages.md`](../../../../skills/reference/packages.md)
