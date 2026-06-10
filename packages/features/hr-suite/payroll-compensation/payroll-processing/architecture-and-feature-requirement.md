# Payroll Processing
## Business Definition
**Payroll Processing is the HRM function that calculates, validates, approves, and produces employee pay, including wages, salaries, allowances, overtime, deductions, taxes, statutory contributions, employer contributions, net pay, payroll journals, and payment files across defined pay schedules and payroll structures.**

---
# Payroll Processing Includes

| Area                                   | What It Covers                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Payroll Calendar**                   | Pay period, pay date, cutoff date, payroll cycle, payroll schedule                               |
| **Pay Group Management**               | Monthly payroll, weekly payroll, bi-weekly payroll, contract payroll, executive payroll          |
| **Salary Calculation**                 | Basic salary, fixed salary, daily wage, hourly wage, prorated salary                             |
| **Allowance Calculation**              | Fixed allowance, variable allowance, transport allowance, meal allowance, housing allowance      |
| **Overtime Calculation**               | Overtime hours, overtime rate, rest day overtime, public holiday overtime                        |
| **Deduction Calculation**              | Unpaid leave, lateness, absence, loan deduction, advance deduction, penalty deduction            |
| **Tax Calculation Reference**          | Employee tax deduction, employer tax obligation, tax category reference                          |
| **Statutory Contribution Calculation** | Employee contribution, employer contribution, statutory deduction, statutory employer cost       |
| **Employer Contribution**              | Employer-side statutory, insurance, pension, benefit, levy, or fund contributions                |
| **Net Pay Calculation**                | Gross pay minus deductions, tax, and employee contributions                                      |
| **Payroll Input Collection**           | Attendance input, leave input, overtime input, claims input, commission input, manual adjustment |
| **Payroll Adjustment**                 | One-time earning, one-time deduction, correction, retroactive adjustment                         |
| **Proration**                          | New joiner proration, resignation proration, unpaid leave proration, salary change proration     |
| **Payroll Validation**                 | Missing data check, negative pay check, abnormal variance check, statutory readiness check       |
| **Payroll Approval**                   | Payroll review, approval workflow, payroll lock, payroll release                                 |
| **Payslip Generation**                 | Payslip preview, finalized payslip, employee payslip access                                      |
| **Payment Processing Reference**       | Bank payment file, payment batch, payment status, payment date                                   |
| **Payroll Journal Reference**          | Payroll journal, cost center allocation, finance posting reference                               |
| **Payroll Audit Trail**                | Calculation run, adjustment, approval, release, payment, correction, timestamp, user             |

---
# Payroll Processing Does Not Include

| Excluded Area                                 | Owned By                                 |
| --------------------------------------------- | ---------------------------------------- |
| Employee master profile                       | Employee Records Management              |
| Organization hierarchy                        | Organizational Chart & Hierarchy         |
| Attendance clocking records                   | Time & Attendance                        |
| Leave application workflow                    | Leave Management                         |
| Expense claim submission                      | Expense Reimbursement                    |
| Benefits plan configuration                   | Benefits Administration                  |
| Bonus plan configuration                      | Bonus & Incentive Management             |
| Compensation budget planning                  | Compensation Planning & Modeling         |
| Market salary survey management               | Salary Benchmarking & Surveys            |
| Multi-country payroll rule library            | Multi-Country Payroll                    |
| Bank account master update request            | Employee Self-Service / Employee Records |
| Finance general ledger ownership              | Finance / Accounting                     |
| Payment gateway or bank integration ownership | Treasury / Finance Integration           |
| Tax filing submission workflow                | Tax / Statutory Reporting                |

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
# Payroll Processing Requirement Statement

| Requirement            | Description                                                                                                                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payroll Processing** | Calculates wages, salaries, allowances, overtime, deductions, taxes, statutory contributions, employer contributions, and net pay with support for multiple pay schedules, payroll structures, proration, adjustments, validation, approvals, payslip generation, payment files, payroll journals, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-PAY-001** | System shall create and maintain payroll cycles by pay group, pay period, cutoff date, and pay date.                                |
| **HRM-PAY-002** | System shall support multiple pay schedules including monthly, weekly, bi-weekly, semi-monthly, and ad hoc payroll.                 |
| **HRM-PAY-003** | System shall assign employees to payroll groups.                                                                                    |
| **HRM-PAY-004** | System shall calculate basic salary, hourly wages, daily wages, and fixed earnings.                                                 |
| **HRM-PAY-005** | System shall calculate fixed and variable allowances.                                                                               |
| **HRM-PAY-006** | System shall calculate overtime based on approved overtime inputs and configured rates.                                             |
| **HRM-PAY-007** | System shall calculate unpaid leave, absence, lateness, and other attendance-related deductions.                                    |
| **HRM-PAY-008** | System shall calculate employee tax deductions based on applicable tax configuration reference.                                     |
| **HRM-PAY-009** | System shall calculate employee statutory contributions.                                                                            |
| **HRM-PAY-010** | System shall calculate employer statutory contributions and employer payroll costs.                                                 |
| **HRM-PAY-011** | System shall support recurring earnings and recurring deductions.                                                                   |
| **HRM-PAY-012** | System shall support one-time earnings and one-time deductions.                                                                     |
| **HRM-PAY-013** | System shall support manual payroll adjustments with reason and approval reference.                                                 |
| **HRM-PAY-014** | System shall support salary proration for new joiners, resignations, unpaid leave, and mid-period salary changes.                   |
| **HRM-PAY-015** | System shall support retroactive payroll adjustments.                                                                               |
| **HRM-PAY-016** | System shall import or receive approved payroll inputs from attendance, leave, claims, benefits, commissions, and employee records. |
| **HRM-PAY-017** | System shall validate payroll readiness before payroll calculation.                                                                 |
| **HRM-PAY-018** | System shall flag missing employee payroll data before payroll run.                                                                 |
| **HRM-PAY-019** | System shall flag abnormal payroll variances compared with previous payroll cycles.                                                 |
| **HRM-PAY-020** | System shall prevent payroll finalization when blocking validation errors exist.                                                    |
| **HRM-PAY-021** | System shall support payroll preview before final approval.                                                                         |
| **HRM-PAY-022** | System shall support payroll approval workflow.                                                                                     |
| **HRM-PAY-023** | System shall lock payroll after final approval.                                                                                     |
| **HRM-PAY-024** | System shall generate employee payslips after payroll finalization.                                                                 |
| **HRM-PAY-025** | System shall support payslip access through Employee Self-Service.                                                                  |
| **HRM-PAY-026** | System shall generate payment batch or bank payment file.                                                                           |
| **HRM-PAY-027** | System shall track payroll payment status.                                                                                          |
| **HRM-PAY-028** | System shall generate payroll journal entries or finance posting references.                                                        |
| **HRM-PAY-029** | System shall support payroll correction or reversal with authorization.                                                             |
| **HRM-PAY-030** | System shall maintain audit trail for payroll calculation, adjustment, approval, finalization, payment, correction, and reversal.   |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                      |
| --: | ------------------------------------------------------------------------------------------------------------------------ |
|   1 | Payroll cycle can be created with pay group, period start, period end, cutoff date, and pay date.                        |
|   2 | Employees can be assigned to payroll groups.                                                                             |
|   3 | Payroll can calculate basic salary, allowances, overtime, deductions, taxes, and statutory contributions.                |
|   4 | Payroll can calculate employer contributions and employer payroll cost.                                                  |
|   5 | Payroll supports monthly, weekly, bi-weekly, semi-monthly, and ad hoc pay schedules where enabled.                       |
|   6 | Payroll supports salary proration for new joiners, resignations, unpaid leave, and mid-period salary changes.            |
|   7 | Payroll accepts approved inputs from attendance, leave, claims, benefits, and commissions.                               |
|   8 | Payroll flags employees with missing mandatory payroll data.                                                             |
|   9 | Payroll flags abnormal salary variance compared with previous payroll cycle.                                             |
|  10 | Payroll cannot be finalized when blocking validation errors exist.                                                       |
|  11 | Payroll preview can be reviewed before approval.                                                                         |
|  12 | Payroll approval workflow can be completed before finalization.                                                          |
|  13 | Finalized payroll becomes locked from normal editing.                                                                    |
|  14 | Payslips are generated after payroll finalization.                                                                       |
|  15 | Employees can access authorized payslips through Employee Self-Service.                                                  |
|  16 | Payroll payment batch or bank payment file can be generated.                                                             |
|  17 | Payroll payment status can be tracked.                                                                                   |
|  18 | Payroll journal or finance posting reference can be generated.                                                           |
|  19 | Payroll correction or reversal requires authorization.                                                                   |
|  20 | Every payroll calculation, adjustment, approval, finalization, payment, correction, and reversal creates an audit event. |

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
| HRM-PAY-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-PAY-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-PAY-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-payroll-compensation-payroll-processing typecheck`
2. `pnpm --filter @repo/features-payroll-compensation-payroll-processing lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
