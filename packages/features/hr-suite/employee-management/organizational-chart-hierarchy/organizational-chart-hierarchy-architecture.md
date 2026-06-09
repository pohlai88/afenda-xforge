# Organizational Chart & Hierarchy

## Definition

Organizational Chart & Hierarchy is the HR suite capability that maintains and visualizes the official organizational structure across legal entities, business units, departments, teams, positions, reporting lines, managerial hierarchy, and effective-dated structural changes. It provides the structural backbone that adjacent HR workflows use for assignment, approval routing, headcount visibility, vacancy tracking, and organizational traceability.

## Architecture intent

This capability is designed for modern, multi-entity HR operations where structure is both operational data and a dependency for many other domains. The architecture must support:

- a canonical hierarchy model for organization units, positions, and reporting relationships
- effective-dated structural changes without losing historical traceability
- safe hierarchy mutation with loop prevention and parent-child integrity
- derived views for org chart, reporting lines, vacancies, headcount, and audit surfaces
- controlled write access so structural changes are governed and explainable

The module should behave as the source of organizational structure for the HR suite boundary, not as a static chart renderer or a loose collection of directory filters.

## Scope

### Included

- legal entity, business unit, department, sub-department, team, and location structures
- parent-child organization hierarchy
- position records within organizational units
- reporting-line and managerial relationship tracking
- org chart and reporting-tree visualization support
- vacancy and headcount views
- cost-center, location, and legal-entity references
- effective-dated structure changes
- approval-routing and escalation-reference support
- audit visibility for structure mutations

### Excluded

- employee personal profile ownership
- employee employment-history ownership
- document storage and document-version workflow
- payroll calculation and finance posting
- recruiting pipeline and applicant processing
- leave, attendance, and time capture
- employee self-service profile management
- performance, learning, and compliance workflow ownership
- offboarding and asset-recovery process ownership

## Core domain model

### Organization unit

The organization unit is the core structural node of the hierarchy. It represents entities such as legal entities, business units, departments, sub-departments, teams, and locations.

It should carry:

- stable unit identifier
- code and display name
- unit type
- parent relationship
- manager reference
- legal-entity, location, and cost-center references
- operational status
- effective-from date

### Position

Positions represent structural seats within the organization. They should be related to organization units while preserving position-specific status and assignment context.

They should support:

- position identifier and code
- title
- owning department or unit
- manager reference
- cost-center and location references
- effective date
- status such as planned, active, frozen, or closed

### Reporting relationship

Reporting relationships model how employees relate to managers beyond the unit tree. This includes direct and non-standard reporting lines that workflows may need for approvals or escalation.

They should maintain:

- employee reference
- manager reference
- relationship type
- effective date
- optional reason or context

### Org chart node

The org chart node is a projection optimized for visualization and lightweight operational views. It should expose structural information without forcing every consumer to reconstruct the tree from raw records.

It should present:

- node identity
- code and name
- unit type
- parent reference
- display-friendly manager information
- status
- child count

### Structure audit event

Audit events record structural changes and should cover unit updates, position updates, and reporting-line changes. This is necessary because hierarchy edits often affect approval logic, reporting visibility, and downstream HR operations.

## System architecture

### 1. Structural write layer

Organizational changes should enter through explicit commands rather than direct object mutation.

Common commands:

- upsert organization unit
- upsert position
- upsert reporting relationship

The write layer should validate schema correctness, structural integrity, authorization, and lifecycle rules before changing state.

### 2. Store and mutation orchestration

The architecture should separate write orchestration from storage details:

- actions parse and validate form input
- the store applies structural mutations
- shared result helpers normalize write outcomes
- event constants label audit-significant actions

This keeps structural changes explicit and makes it easier to harden the module later with persistence and stricter invariants.

### 3. Read-model and projection layer

The package should expose derived read models for operational consumption instead of requiring each caller to reconstruct organizational views manually.

Primary projections:

- org chart tree nodes
- overview snapshot
- organization units window
- positions window
- reporting lines window
- vacancies window
- headcount window
- audit-trail window

These views should be built from normalized structural state and remain consistent across surfaces.

### 4. Page-model layer

The page-model layer should compose query results, search parameters, UI copy, and surface metadata into a single server-ready payload for the organizational workspace.

This allows the package to expose:

- overview stats
- chart nodes
- surface lists
- search state
- picker options
- write capability flags

## Workflow architecture

### Structure creation and maintenance

Organization units and positions should be created and updated through governed forms and server actions. The system should support current structure maintenance without assuming the hierarchy is flat or static.

### Reporting-line maintenance

Reporting relationships should be maintained separately from the pure parent-child unit hierarchy. This avoids conflating department structure with employee-manager workflow routing.

### Reorganization handling

The architecture should support current and future structural changes without destroying historical traceability. Effective dates should allow future planning and later activation of structural changes.

### Operational visibility

HR users should be able to inspect the structure through dedicated views for units, positions, reporting lines, vacancies, headcount, and audit history rather than relying on one overloaded org chart surface.

## Security and governance

Organizational structure is not usually as sensitive as personal employee data, but it is still governed data because it drives approvals, visibility, and workforce planning.

Required controls:

- role-based write restrictions for structural changes
- clear capability flags for editable versus read-only usage
- controlled access to audit-relevant structure changes
- validation against malformed or incomplete writes
- safe handling of invalid structural relationships

The package should assume many users can read the structure while only a smaller set can change it.

## Audit and traceability

Every meaningful structure change should be traceable.

Audit should capture:

- who performed the action
- what structural object changed
- when the change occurred
- the action type
- the resulting target identifier
- the relevant effective date or structural context

This matters because a unit or reporting-line change can affect downstream routing and reporting behavior immediately.

## Data governance

The module should treat organizational structure as governed reference data rather than disposable UI state.

Key rules:

- preserve stable identifiers for units, positions, and reporting relationships
- enforce valid parent-child relationships
- separate current structural state from projection-friendly read models
- keep status and effective-date semantics explicit
- avoid mixing employee master-profile ownership into the structure domain

Retention and history strategy should support auditability and organizational-change analysis.

## Integrations

Organizational Chart & Hierarchy should integrate with adjacent HR domains while remaining the owner of the formal structure model.

Primary integrations:

- employee records for employee, manager, and assignment references
- approval workflows for reporting-chain resolution
- payroll or finance systems for cost-center alignment
- time and attendance for manager and organizational lookups
- analytics and reporting for headcount and vacancy rollups
- access-control systems for write governance

The package should provide stable structure contracts so dependent modules do not invent their own hierarchy models.

## Operational model

### Performance

Org-chart and list views should be fast enough for daily HR operations. Common filters such as unit type, status, location, and legal entity should be projection-friendly.

### Reliability

The module should tolerate incomplete downstream integrations. Structural data should remain usable even when optional employee or analytics enrichments are unavailable.

### Explainability

HR operators should be able to understand why a node appears where it does, who manages it, what its status is, and how it connects to reporting and vacancy views.

### Scalability

The design should support:

- large multi-level hierarchies
- many legal entities and locations
- frequent reorganizations
- enterprise reporting and export use cases
- many dependent HR workflows

## UX surfaces

Modern HR suites should expose organizational structure through a focused set of surfaces:

- org chart
- units list
- positions list
- reporting lines list
- vacancies list
- headcount list
- overview statistics
- audit-trail view

Each surface should answer one structural question quickly:

- what exists
- where it sits in the hierarchy
- who manages it
- whether it is filled or vacant
- what changed
- whether it is active, planned, frozen, or closed

## Non-goals

This capability should not become an employee-profile system, a payroll engine, or a generic document-management module. It should own the organization structure and the derived operational views around that structure.

## Notes

The package is already more than a bare scaffold. It contains structure-specific contracts, store logic, server actions, queries, page-model composition, and surface metadata. This document describes both the target architecture and the current package’s partial implementation state.

## Codebase mapping

The current package already models core organization-structure concepts and exposes both mutation and read-model entry points. It is still lightweight in persistence and business-rule depth, but it already reflects the organizational-chart domain clearly.

### What exists today

| Area | Code location | Current behavior |
| --- | --- | --- |
| Feature identity | [`src/metadata.ts`](src/metadata.ts), [`src/manifest.ts`](src/manifest.ts), [`src/shared/index.ts`](src/shared/index.ts) | Declares feature metadata, package scope, package name, and legacy source provenance |
| Public contracts | [`src/contract.ts`](src/contract.ts), [`src/hr.workforce.org.contract.ts`](src/hr.workforce.org.contract.ts) | Exposes org-unit status and type schemas plus the underlying domain types for units, chart nodes, searches, and upsert inputs |
| Public door | [`src/index.ts`](src/index.ts), [`src/server.ts`](src/server.ts) | Re-exports the server-only package API, queries, mutations, and page-model builder |
| Write actions | [`src/actions.ts`](src/actions.ts), [`src/hr.workforce.org.actions.server.ts`](src/hr.workforce.org.actions.server.ts) | Accepts form-driven upserts for units, positions, and reporting relationships |
| Query layer | [`src/queries.ts`](src/queries.ts), [`src/hr.workforce.org.queries.ts`](src/hr.workforce.org.queries.ts) | Exposes chart, overview, units, positions, reporting lines, vacancies, headcount, and audit windows |
| Page model | [`src/hr.workforce.org.page-model.server.ts`](src/hr.workforce.org.page-model.server.ts) | Composes search state and all read surfaces into a server-ready organizational workspace model |
| Store | [`src/hr.workforce.org.store.ts`](src/hr.workforce.org.store.ts) | Uses an in-memory store to persist structural nodes for units, positions, and reporting relationships |
| Forms and surface helpers | [`src/hr.workforce.org-form.shared.ts`](src/hr.workforce.org-form.shared.ts), `src/hr.workforce.org-*.surface.ts`, `src/hr.workforce.org-*.shared.ts` | Defines schema validation, UI copy, columns, metadata, and list-surface helpers |
| Events and execution surface | [`src/hr.workforce.org.event.ts`](src/hr.workforce.org.event.ts), [`src/execution/index.ts`](src/execution/index.ts) | Defines audit-style action names and wraps the write operations into a callable execution surface |

### What the code does not yet fully implement

- no durable database-backed repository
- no explicit hierarchy-loop prevention in the current store implementation
- no real separation between unit, position, and reporting-line persistence models
- no full effective-dated historical structure engine
- no real vacancy, headcount, or audit-trail persistence beyond placeholder query outputs
- no employee or workflow integration beyond structural references

### Mapping judgment

The package already has real domain-specific structure, but much of the operational depth is still placeholder-grade. The architecture doc should therefore be read as a target design with a partially implemented Xforge package beneath it.

## Upgrade plan

### Phase 1: Replace the lightweight store with durable structure persistence

Objective: move from package-local state to reliable organizational master data.

Deliverables:

- persistent repositories for units, positions, and reporting relationships
- structural identity and uniqueness rules
- durable audit-event persistence
- consistent update semantics for created and updated records

### Phase 2: Enforce structural integrity and temporal behavior

Objective: make the hierarchy safe and historically traceable.

Deliverables:

- parent-child loop prevention
- self-parent validation
- effective-dated structural transitions
- historical structure snapshots or temporal querying

### Phase 3: Separate structural models from derived operational views

Objective: improve correctness of org-chart, vacancy, and headcount surfaces.

Deliverables:

- dedicated position model separate from org-unit node projection
- dedicated reporting-line model
- computed vacancy and headcount projections
- richer chart-tree assembly with accurate child counts

### Phase 4: Integrate with adjacent HR domains

Objective: stop relying on placeholders for structural context.

Deliverables:

- employee-reference validation through employee records
- manager and assignment resolution
- approval-routing integration
- cost-center and location-reference normalization

### Phase 5: Operational hardening

Objective: make the capability enterprise-ready.

Deliverables:

- search and filter support across all windows
- export-safe read models
- permission-enforced mutation boundaries
- tests for hierarchy integrity, effective dates, and query correctness

## Repair priorities

These are the highest-value fixes to bring the current package closer to the target architecture.

1. Replace the in-memory `hrOrgStore` with durable persistence.
2. Split unit, position, and reporting-line data into distinct persistence models instead of storing all three as chart nodes.
3. Add hierarchy-integrity validation for loops, self-parenting, and invalid parent types.
4. Implement real vacancy, headcount, and audit-trail projections instead of placeholder results.
5. Add tests for upsert flows, effective-date handling, and page-model correctness.
