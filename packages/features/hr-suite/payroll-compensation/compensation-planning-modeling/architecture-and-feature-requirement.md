# Compensation Planning & Modeling
## Business Definition
**Compensation Planning & Modeling is the HRM function that plans, models, reviews, approves, and controls employee compensation changes, including salary adjustments, merit increases, promotion increases, market adjustments, total compensation packages, budget pools, compensation scenarios, and approval workflows.**

---
# Compensation Planning & Modeling Includes

| Area                               | What It Covers                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| **Compensation Cycle Planning**    | Annual salary review, mid-year review, promotion cycle, adjustment cycle                    |
| **Budget Pool Management**         | Salary increase budget, merit budget, promotion budget, bonus budget reference              |
| **Merit Increase Planning**        | Performance-based salary increase recommendation                                            |
| **Salary Adjustment Modeling**     | Salary correction, market adjustment, equity adjustment, retention adjustment               |
| **Promotion Increase Modeling**    | Salary change linked to promotion, grade change, job level change                           |
| **Total Compensation Modeling**    | Base salary, allowances, bonus reference, incentives, benefits, employer cost               |
| **Compensation Scenario Modeling** | What-if salary scenarios, proposed increase, revised package, budget impact                 |
| **Compensation Eligibility**       | Eligibility by employment type, grade, performance rating, tenure, department, legal entity |
| **Salary Structure Reference**     | Grade range, salary band, minimum, midpoint, maximum, compa-ratio reference                 |
| **Pay Equity Reference**           | Internal equity comparison, pay gap indicator, exception flag                               |
| **Market Benchmark Reference**     | External salary benchmark reference, market percentile reference                            |
| **Manager Recommendation**         | Proposed salary adjustment, justification, manager comments                                 |
| **HR Review**                      | HR validation, salary band check, equity check, policy compliance check                     |
| **Approval Workflow**              | Manager, department head, HR, finance, executive approval                                   |
| **Budget Control**                 | Budget utilization, remaining budget, over-budget warning, approval override                |
| **Compensation Letter Reference**  | Salary revision letter, promotion letter, adjustment letter                                 |
| **Payroll Integration**            | Approved salary change effective date and payroll update reference                          |
| **Compensation Audit Trail**       | Proposed by, reviewed by, approved by, rejected by, effective date, reason, timestamp       |

---
# Compensation Planning & Modeling Does Not Include

| Excluded Area                       | Owned By                                |
| ----------------------------------- | --------------------------------------- |
| Employee master profile             | Employee Records Management             |
| Employee job and assignment record  | Employee Records / Organizational Chart |
| Payroll calculation                 | Payroll Processing                      |
| Payroll run finalization            | Payroll Processing                      |
| Bonus calculation execution         | Bonus & Incentive Management            |
| Benefits enrollment                 | Benefits Administration                 |
| Expense claims                      | Expense Reimbursement                   |
| Salary survey data source ownership | Salary Benchmarking & Surveys           |
| Performance review scoring          | Performance Management                  |
| Promotion lifecycle workflow        | Employee Lifecycle Management           |
| Finance budget ownership            | Finance / Budgeting                     |
| General ledger posting              | Finance / Accounting                    |
| Employment contract storage         | Document Management                     |

---
# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Feature-owned business records, workflows, and projections | This feature package | This package is the canonical owner for its own commands, read models, and audit-relevant state inside the documented feature boundary. |
| Employee, candidate, organization, position, or company references | Upstream HR source packages | This feature may reference upstream identities and structure, but it must not duplicate canonical master-data ownership. |
| Documents, evidence artifacts, and file storage | Document Management and `packages/storage` | This feature may store references, statuses, or metadata, but it must not own binary file persistence or storage policy. |
| Downstream payroll, reporting, analytics, or external integration outputs | The downstream owning package or external system | This feature should publish validated references, events, or projections instead of mutating downstream source-of-truth state directly. |

---
# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All reads and writes must resolve execution context before accessing data. |
| Permission boundary | All mutations must check capability, policy, or permission before execution. |
| Audit boundary | All state-changing actions must write an audit event or pass through an auditable mutation boundary. |
| API boundary | Public routes must not bypass feature contracts, schemas, or policies. |
| UI boundary | UI must consume projections, page models, or read models instead of raw persistence models. |
| Cross-feature boundary | This feature must integrate through references, contracts, projections, or validated execution flows instead of directly taking ownership of adjacent domain state. |

---
# Compensation Planning & Modeling Requirement Statement

| Requirement                          | Description                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compensation Planning & Modeling** | Models salary adjustments, merit increases, promotion increases, market corrections, equity adjustments, and total compensation packages within defined budget pools, with eligibility rules, salary structure references, scenario modeling, approval workflow, payroll integration, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-CPM-001** | System shall create and manage compensation planning cycles.                                                                                                      |
| **HRM-CPM-002** | System shall define compensation cycle type such as annual review, merit review, promotion review, market adjustment, equity adjustment, or retention adjustment. |
| **HRM-CPM-003** | System shall define compensation budget pools by legal entity, department, business unit, grade, location, or manager group.                                      |
| **HRM-CPM-004** | System shall assign eligible employees to a compensation planning cycle.                                                                                          |
| **HRM-CPM-005** | System shall determine compensation eligibility based on employment type, status, tenure, grade, job level, department, legal entity, and performance rating.     |
| **HRM-CPM-006** | System shall display current salary, current grade, current job level, department, manager, and effective date.                                                   |
| **HRM-CPM-007** | System shall display salary structure reference including salary band minimum, midpoint, maximum, and range position.                                             |
| **HRM-CPM-008** | System shall support merit increase recommendation.                                                                                                               |
| **HRM-CPM-009** | System shall support promotion-related salary increase recommendation.                                                                                            |
| **HRM-CPM-010** | System shall support market adjustment recommendation.                                                                                                            |
| **HRM-CPM-011** | System shall support equity adjustment recommendation.                                                                                                            |
| **HRM-CPM-012** | System shall support retention adjustment recommendation.                                                                                                         |
| **HRM-CPM-013** | System shall calculate proposed new salary based on increase amount or increase percentage.                                                                       |
| **HRM-CPM-014** | System shall calculate total compensation impact including base salary, allowances, bonus reference, benefits reference, and employer cost reference.             |
| **HRM-CPM-015** | System shall support what-if compensation scenarios before final approval.                                                                                        |
| **HRM-CPM-016** | System shall compare proposed salary against salary band minimum, midpoint, and maximum.                                                                          |
| **HRM-CPM-017** | System shall flag proposed salary below minimum or above maximum salary band.                                                                                     |
| **HRM-CPM-018** | System shall calculate compensation budget utilization.                                                                                                           |
| **HRM-CPM-019** | System shall flag over-budget recommendations.                                                                                                                    |
| **HRM-CPM-020** | System shall require justification for exceptions, over-budget increases, above-band increases, and special adjustments.                                          |
| **HRM-CPM-021** | System shall allow managers to submit compensation recommendations.                                                                                               |
| **HRM-CPM-022** | System shall allow HR to review, adjust, approve, return, or reject compensation recommendations.                                                                 |
| **HRM-CPM-023** | System shall route compensation recommendations through approval workflow.                                                                                        |
| **HRM-CPM-024** | System shall support approval routing by legal entity, department, amount, percentage, grade, manager, and budget impact.                                         |
| **HRM-CPM-025** | System shall lock approved compensation recommendations after final approval.                                                                                     |
| **HRM-CPM-026** | System shall generate approved salary change records with effective date.                                                                                         |
| **HRM-CPM-027** | System shall send approved compensation changes to Payroll Processing.                                                                                            |
| **HRM-CPM-028** | System shall link approved compensation changes to employee history.                                                                                              |
| **HRM-CPM-029** | System shall support compensation planning reports by department, manager, legal entity, grade, budget pool, and status.                                          |
| **HRM-CPM-030** | System shall maintain audit trail for compensation cycle creation, recommendation, adjustment, review, approval, rejection, exception, and payroll integration.   |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                           |
| --: | ----------------------------------------------------------------------------------------------------------------------------- |
|   1 | Compensation planning cycle can be created with cycle type, effective date, eligible population, and approval rules.          |
|   2 | Budget pool can be assigned by legal entity, department, business unit, grade, location, or manager group.                    |
|   3 | Eligible employees can be included in the compensation cycle.                                                                 |
|   4 | Ineligible employees are excluded or flagged based on eligibility rules.                                                      |
|   5 | Current salary, grade, job level, department, manager, and salary effective date are visible during planning.                 |
|   6 | Salary band minimum, midpoint, maximum, and range position are visible where configured.                                      |
|   7 | Manager can propose merit increase by amount or percentage.                                                                   |
|   8 | Manager can propose promotion, market, equity, or retention adjustment where authorized.                                      |
|   9 | System calculates proposed new salary automatically.                                                                          |
|  10 | System calculates budget impact of proposed compensation changes.                                                             |
|  11 | System flags recommendations that exceed the allocated budget.                                                                |
|  12 | System flags proposed salary below salary band minimum or above salary band maximum.                                          |
|  13 | Exception justification is required for over-budget or outside-band recommendations.                                          |
|  14 | HR can review, adjust, return, approve, or reject compensation recommendations.                                               |
|  15 | Compensation recommendation follows configured approval workflow.                                                             |
|  16 | Approved recommendations are locked from normal editing.                                                                      |
|  17 | Approved salary change creates an effective-dated compensation record.                                                        |
|  18 | Approved compensation change is sent to Payroll Processing.                                                                   |
|  19 | Approved compensation change is reflected in employee history.                                                                |
|  20 | Compensation planning reports can be generated by department, manager, legal entity, grade, budget pool, and approval status. |
|  21 | Unauthorized users cannot view or edit restricted compensation planning data.                                                 |
|  22 | Every compensation planning action creates an audit event.                                                                    |

---
# Definition of Done

This section replaces separate package-level `dod.md` files for this feature package. A change is done only when the implemented slice matches the documented boundary and the verification evidence is current.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The change preserves documented source-of-truth ownership, feature scope, and platform governance constraints. |
| Contracts and schemas | Public contracts, schemas, and manifest surfaces are explicit, stable, and aligned with the documented feature boundary. |
| Validation and policy enforcement | Invalid inputs, invalid scope, policy violations, and unsafe state transitions fail clearly and safely. |
| Runtime behavior | Queries, actions, execution paths, and repository behavior remain deterministic and do not create hidden cross-feature ownership. |
| Tests and verification | The relevant lint, typecheck, and test commands pass for the package, or any missing verification is explicitly documented as a gap. |
| Documentation | This document, package exports, and any development roadmap or implementation guidance reflect the actual package structure. |
| Release readiness | The implemented slice is safe to expose to its intended audience, or the remaining scope is explicitly marked as partial. |

---
# Implementation Status

**Status:** Partial

**Last audited:** 2026-06-10

This section reflects the package surface that exists in code today. Unless a row says otherwise, the evidence below confirms package-owned contracts, actions, queries, repository boundaries, and tests rather than a complete end-to-end application audit.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts) |
| Authorization and policy boundary | Partial | [`src/manifest.ts`](./src/manifest.ts) |
| Source-of-truth integration | Partial | [`src/metadata.ts`](./src/metadata.ts) |
| Repository and persistence | Not started | [`package.json`](./package.json) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not defined inside this package. |
| Requirement coverage registry | Not started | [`src/manifest.ts`](./src/manifest.ts) |
| Verification tests | Not started | [`package.json`](./package.json) |

### Planning Mark

- `Current audited slices: package surface, contracts, queries, actions, repository, and verification assets`
- `Slice status: partial`
- `Feature status: partially implemented`

---
# Requirement Coverage

This package does not yet carry a complete row-by-row requirement audit in code unless explicitly linked below. The table records the currently auditable package-owned slice and should be expanded as implementation evidence becomes more precise.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-CPM-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-CPM-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-CPM-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

---
# Element-by-Element Code Evaluation

This evaluation reflects the current package codebase as of 2026-06-10. It records the implementation surfaces that future slices should preserve and extend rather than bypass.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature manifest and metadata | Implemented as package-owned manifest and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve the exported package identity, manifest surface, and metadata contract when adding routes or UI integrations. |
| Contract and schema boundary | Implemented through explicit contract or schema files. | [`src/contract.ts`](./src/contract.ts) | Add new inputs and outputs through stable contracts and schemas instead of ad hoc object shapes. |
| Query and read-model surface | Implemented through package-owned query or projection surfaces. | [`src/queries.ts`](./src/queries.ts) | Keep UI and API consumers on read models or query surfaces rather than repository internals. |
| Action and execution surface | Implemented through action or execution files. | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) | Route mutations through explicit actions and execution helpers so policy, audit, and validation can be enforced centrally. |
| Repository or store boundary | Not started as a dedicated persistence boundary. | [`package.json`](./package.json) | Preserve a single persistence boundary so future storage changes do not leak into contracts or UI surfaces. |
| Verification surface | Package tests are not yet present. | [`package.json`](./package.json) | Add targeted tests as feature slices become production-critical, especially around policies, actions, and read-model correctness. |

---
# Verification Summary

1. `pnpm --filter @repo/features-payroll-compensation-compensation-planning-modeling typecheck`
2. `pnpm --filter @repo/features-payroll-compensation-compensation-planning-modeling lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
