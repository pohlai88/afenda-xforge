# Benefits Administration
## Business Definition
**Benefits Administration is the HRM function that manages employee benefit plans, eligibility, enrollment, coverage, dependents, employer contributions, employee deductions, benefit changes, benefit claims references, payroll deduction integration, and benefit compliance records.**

---
# Benefits Administration Includes

| Area                              | What It Covers                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Benefit Plan Management**       | Medical plan, dental plan, insurance plan, retirement plan, wellness plan, allowance plan           |
| **Benefit Category**              | Health, insurance, retirement, welfare, transport, meal, housing, education, wellness               |
| **Eligibility Rules**             | Eligibility by employment type, grade, job level, location, legal entity, tenure, employee category |
| **Enrollment Management**         | Employee enrollment, open enrollment, new hire enrollment, life-event enrollment                    |
| **Dependent Coverage**            | Spouse, children, family members, dependent eligibility, dependent documents                        |
| **Coverage Level**                | Employee only, employee + spouse, employee + children, family coverage                              |
| **Employer Contribution**         | Employer-paid premium, employer contribution amount, company subsidy                                |
| **Employee Contribution**         | Employee-paid portion, payroll deduction amount, deduction frequency                                |
| **Benefit Effective Dates**       | Coverage start date, coverage end date, enrollment date, termination date                           |
| **Benefit Change Management**     | Plan change, coverage change, dependent change, contribution change                                 |
| **Benefit Deduction Integration** | Payroll deduction setup, recurring deduction, benefit-related taxable treatment                     |
| **Benefit Provider Reference**    | Insurance provider, benefit vendor, plan administrator                                              |
| **Benefit Document Reference**    | Policy document, enrollment form, dependent document, approval document                             |
| **Benefit Claims Reference**      | Claim reference, reimbursement reference, approval status, payment reference                        |
| **Benefit Compliance**            | Mandatory benefit eligibility, statutory benefit reference, coverage requirement                    |
| **Benefit Reporting**             | Enrollment report, cost report, deduction report, dependent report, provider report                 |
| **Benefit Audit Trail**           | Enrolled by, changed by, approved by, effective date, previous plan, new plan, timestamp            |

---
# Benefits Administration Does Not Include

| Excluded Area                       | Owned By                                  |
| ----------------------------------- | ----------------------------------------- |
| Employee master profile             | Employee Records Management               |
| Employee dependents master data     | Employee Records / Employee Self-Service  |
| Payroll calculation                 | Payroll Processing                        |
| Payroll run finalization            | Payroll Processing                        |
| Country statutory payroll rules     | Multi-Country Payroll                     |
| Expense claim submission            | Expense Reimbursement                     |
| Medical claim processing workflow   | Expense Reimbursement / Claims Management |
| Insurance provider system ownership | External Provider / Integration           |
| Document storage engine             | Document Management                       |
| Organization hierarchy              | Organizational Chart & Hierarchy          |
| Leave entitlement calculation       | Leave Management                          |
| Attendance records                  | Time & Attendance                         |
| Compensation budgeting              | Compensation Planning & Modeling          |
| Bonus calculation                   | Bonus & Incentive Management              |
| Salary market comparison            | Salary Benchmarking & Surveys             |

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
# Benefits Administration Requirement Statement

| Requirement                 | Description                                                                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Benefits Administration** | Manages employee benefit plans including eligibility, enrollment, dependent coverage, employer contributions, employee contributions, payroll deduction integration, benefit effective dates, provider references, benefit documents, benefit changes, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-BEN-001** | System shall create and maintain benefit plans.                                                                                                        |
| **HRM-BEN-002** | System shall classify benefit plans by benefit category.                                                                                               |
| **HRM-BEN-003** | System shall configure benefit eligibility rules by legal entity, country, location, employment type, grade, job level, employee category, and tenure. |
| **HRM-BEN-004** | System shall determine employee eligibility for benefit plans.                                                                                         |
| **HRM-BEN-005** | System shall support new hire benefit enrollment.                                                                                                      |
| **HRM-BEN-006** | System shall support open enrollment periods.                                                                                                          |
| **HRM-BEN-007** | System shall support life-event enrollment changes.                                                                                                    |
| **HRM-BEN-008** | System shall allow eligible employees to enroll in available benefit plans.                                                                            |
| **HRM-BEN-009** | System shall support dependent enrollment where applicable.                                                                                            |
| **HRM-BEN-010** | System shall validate dependent eligibility.                                                                                                           |
| **HRM-BEN-011** | System shall support coverage levels including employee only, employee plus spouse, employee plus children, and family coverage.                       |
| **HRM-BEN-012** | System shall maintain benefit effective start date and end date.                                                                                       |
| **HRM-BEN-013** | System shall calculate or store employer contribution amount for benefit plans.                                                                        |
| **HRM-BEN-014** | System shall calculate or store employee contribution amount for benefit plans.                                                                        |
| **HRM-BEN-015** | System shall create payroll deduction references for employee-paid benefit contributions.                                                              |
| **HRM-BEN-016** | System shall integrate approved benefit deductions with Payroll Processing.                                                                            |
| **HRM-BEN-017** | System shall support recurring benefit deductions.                                                                                                     |
| **HRM-BEN-018** | System shall support benefit plan change, coverage change, dependent change, and contribution change.                                                  |
| **HRM-BEN-019** | System shall support benefit enrollment approval workflow where required.                                                                              |
| **HRM-BEN-020** | System shall maintain benefit provider and vendor references.                                                                                          |
| **HRM-BEN-021** | System shall link benefit records to supporting documents.                                                                                             |
| **HRM-BEN-022** | System shall track benefit coverage status including pending, active, waived, suspended, terminated, and expired.                                      |
| **HRM-BEN-023** | System shall terminate or adjust benefit coverage when employee employment status changes.                                                             |
| **HRM-BEN-024** | System shall support benefit cost reporting by employee, department, legal entity, country, provider, and plan.                                        |
| **HRM-BEN-025** | System shall support benefit enrollment reporting.                                                                                                     |
| **HRM-BEN-026** | System shall support payroll deduction reporting for benefit contributions.                                                                            |
| **HRM-BEN-027** | System shall restrict access to sensitive benefit information based on role and permission.                                                            |
| **HRM-BEN-028** | System shall maintain audit trail for benefit eligibility, enrollment, waiver, approval, change, termination, deduction, and provider update actions.  |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                     |
| --: | --------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Benefit plan can be created with category, provider, eligibility rules, contribution rules, and effective dates.                        |
|   2 | Benefit plans can be classified by health, insurance, retirement, welfare, transport, meal, housing, education, or wellness category.   |
|   3 | Employee eligibility can be determined based on employment type, grade, legal entity, country, location, tenure, and employee category. |
|   4 | Eligible employees can be enrolled into benefit plans.                                                                                  |
|   5 | Ineligible employees are prevented from enrolling unless authorized override is approved.                                               |
|   6 | New hire enrollment can be triggered after employee onboarding or employment activation.                                                |
|   7 | Open enrollment period can be configured and controlled.                                                                                |
|   8 | Life-event benefit changes can be recorded.                                                                                             |
|   9 | Dependents can be added to benefit coverage where the plan allows it.                                                                   |
|  10 | Dependent eligibility can be validated before coverage activation.                                                                      |
|  11 | Coverage level can be selected and stored.                                                                                              |
|  12 | Benefit coverage start date and end date are recorded.                                                                                  |
|  13 | Employer contribution amount can be calculated or stored.                                                                               |
|  14 | Employee contribution amount can be calculated or stored.                                                                               |
|  15 | Employee-paid benefit contribution can be sent to Payroll Processing as a recurring deduction.                                          |
|  16 | Benefit coverage status can be tracked as pending, active, waived, suspended, terminated, or expired.                                   |
|  17 | Benefit coverage can be adjusted or terminated when employee status changes.                                                            |
|  18 | Supporting benefit documents can be linked to the benefit record.                                                                       |
|  19 | Benefit cost and enrollment reports can be generated.                                                                                   |
|  20 | Sensitive benefit information is hidden from unauthorized users.                                                                        |
|  21 | Every benefit enrollment, waiver, change, termination, approval, and deduction integration creates an audit event.                      |

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
| HRM-BEN-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-BEN-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-BEN-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-payroll-compensation-benefits-administration typecheck`
2. `pnpm --filter @repo/features-payroll-compensation-benefits-administration lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
