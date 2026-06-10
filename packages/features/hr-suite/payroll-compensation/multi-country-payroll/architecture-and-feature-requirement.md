# Multi-Country Payroll
## Business Definition
**Multi-Country Payroll is the HRM function that supports payroll processing across different countries, legal entities, currencies, languages, tax rules, statutory deductions, employer contributions, filing requirements, payroll calendars, and local employment regulations.**

---
# Multi-Country Payroll Includes

| Area                                | What It Covers                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Country Payroll Configuration**   | Country-specific payroll rules, statutory settings, contribution rules, tax rules                          |
| **Legal Entity Payroll Setup**      | Employing entity, registration number, statutory employer account, payroll country                         |
| **Local Tax Rules**                 | Employee tax deduction, employer tax obligation, tax category, tax residency reference                     |
| **Statutory Contributions**         | Pension, social security, unemployment insurance, healthcare, provident fund, levy, mandatory funds        |
| **Employer Contributions**          | Employer-side statutory cost, insurance, pension, levy, payroll tax, local employer obligations            |
| **Local Pay Components**            | Country-specific earnings, allowances, deductions, benefits, reimbursements, taxable/non-taxable treatment |
| **Currency Handling**               | Local currency payroll, foreign currency reference, exchange rate reference, payroll reporting currency    |
| **Payroll Calendar by Country**     | Country-specific pay periods, public holidays, cutoff dates, statutory filing dates                        |
| **Country-Specific Proration**      | New joiner, termination, unpaid leave, mid-period salary change, statutory proration rules                 |
| **Country-Specific Overtime Rules** | Overtime rate, rest day rate, public holiday rate, statutory working-hour limits                           |
| **Country-Specific Leave Impact**   | Paid leave, unpaid leave, statutory leave, maternity/paternity leave payroll treatment                     |
| **Statutory Reporting**             | Local payroll reports, statutory forms, contribution reports, tax reports, year-end reports                |
| **Mandatory Filing**                | Tax filing, contribution filing, employer declaration, employee income statement filing                    |
| **Local Payslip Format**            | Country-required payslip fields, language, currency, statutory breakdown                                   |
| **Compliance Validation**           | Local minimum wage, contribution ceiling, tax threshold, eligibility rules, filing readiness               |
| **Localization Support**            | Local language, date format, address format, tax ID format, statutory ID format                            |
| **Payroll Vendor Integration**      | Local payroll provider file, statutory portal export, bank file by country                                 |
| **Audit Trail**                     | Country rule version, calculation basis, statutory submission, filing status, approval, timestamp          |

---
# Multi-Country Payroll Does Not Include

| Excluded Area                                    | Owned By                           |
| ------------------------------------------------ | ---------------------------------- |
| Core payroll calculation run                     | Payroll Processing                 |
| Employee master profile                          | Employee Records Management        |
| Employee tax ID storage                          | Employee Records / Payroll Profile |
| Payroll approval workflow                        | Payroll Processing                 |
| Payslip generation process                       | Payroll Processing                 |
| Benefits plan management                         | Benefits Administration            |
| Expense claim processing                         | Expense Reimbursement              |
| Bonus plan configuration                         | Bonus & Incentive Management       |
| Compensation budgeting                           | Compensation Planning & Modeling   |
| Market salary survey comparison                  | Salary Benchmarking & Surveys      |
| Leave application workflow                       | Leave Management                   |
| Attendance records                               | Time & Attendance                  |
| Local legal advisory decision-making             | Legal / Compliance                 |
| Government portal submission outside integration | Compliance / Statutory Reporting   |
| Finance general ledger ownership                 | Finance / Accounting               |

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
# Multi-Country Payroll Requirement Statement

| Requirement               | Description                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Country Payroll** | Supports payroll processing across multiple countries by maintaining country-specific payroll configurations, tax rules, statutory deductions, employer contributions, currencies, local pay components, payroll calendars, statutory reports, filing requirements, localized payslip requirements, compliance validations, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-MCP-001** | System shall support payroll configuration by country.                                                                                                      |
| **HRM-MCP-002** | System shall support payroll configuration by legal entity within each country.                                                                             |
| **HRM-MCP-003** | System shall maintain country-specific tax rule references.                                                                                                 |
| **HRM-MCP-004** | System shall maintain country-specific statutory contribution rules.                                                                                        |
| **HRM-MCP-005** | System shall maintain country-specific employer contribution rules.                                                                                         |
| **HRM-MCP-006** | System shall support country-specific earnings, allowances, deductions, and benefits treatment.                                                             |
| **HRM-MCP-007** | System shall classify pay components as taxable, non-taxable, contributable, non-contributable, pensionable, or non-pensionable according to country rules. |
| **HRM-MCP-008** | System shall support local payroll currency by country and legal entity.                                                                                    |
| **HRM-MCP-009** | System shall support exchange rate reference for reporting or cross-country consolidation.                                                                  |
| **HRM-MCP-010** | System shall support country-specific payroll calendars, cutoff dates, pay dates, public holidays, and statutory deadlines.                                 |
| **HRM-MCP-011** | System shall support country-specific proration rules.                                                                                                      |
| **HRM-MCP-012** | System shall support country-specific overtime and rest-day calculation rules.                                                                              |
| **HRM-MCP-013** | System shall support country-specific unpaid leave and statutory leave payroll treatment.                                                                   |
| **HRM-MCP-014** | System shall support country-specific tax residency, employee category, and statutory eligibility classifications.                                          |
| **HRM-MCP-015** | System shall validate employee statutory readiness before country payroll processing.                                                                       |
| **HRM-MCP-016** | System shall validate minimum wage, statutory ceiling, contribution threshold, and tax threshold where applicable.                                          |
| **HRM-MCP-017** | System shall generate country-specific statutory reports.                                                                                                   |
| **HRM-MCP-018** | System shall generate country-specific tax reports.                                                                                                         |
| **HRM-MCP-019** | System shall generate country-specific contribution reports.                                                                                                |
| **HRM-MCP-020** | System shall generate localized payslip fields required by country rules.                                                                                   |
| **HRM-MCP-021** | System shall support country-specific bank payment file formats where enabled.                                                                              |
| **HRM-MCP-022** | System shall support export files for statutory portals or local payroll vendors.                                                                           |
| **HRM-MCP-023** | System shall support country rule versioning.                                                                                                               |
| **HRM-MCP-024** | System shall preserve the rule version used for each finalized payroll calculation.                                                                         |
| **HRM-MCP-025** | System shall restrict modification of country statutory rules to authorized payroll administrators.                                                         |
| **HRM-MCP-026** | System shall support cross-country payroll reporting by legal entity, country, currency, pay group, and period.                                             |
| **HRM-MCP-027** | System shall support consolidated employer payroll cost reporting across countries.                                                                         |
| **HRM-MCP-028** | System shall maintain audit trail for country payroll setup, rule changes, statutory calculations, filing exports, and payroll localization changes.        |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                  |
| --: | -------------------------------------------------------------------------------------------------------------------- |
|   1 | Payroll country can be configured for each legal entity.                                                             |
|   2 | Each country can maintain its own payroll calendar, cutoff date, pay date, public holidays, and statutory deadlines. |
|   3 | Country-specific tax rules can be configured or referenced.                                                          |
|   4 | Country-specific statutory contribution rules can be configured or referenced.                                       |
|   5 | Country-specific employer contribution rules can be configured or referenced.                                        |
|   6 | Pay components can have different taxable and contributable treatment by country.                                    |
|   7 | Employees can be classified by tax residency, statutory eligibility, and local worker category.                      |
|   8 | Payroll validates employee statutory readiness before country payroll processing.                                    |
|   9 | Payroll validates minimum wage, contribution ceiling, tax threshold, and statutory eligibility where applicable.     |
|  10 | Payroll supports local payroll currency by country.                                                                  |
|  11 | Exchange rate reference is available for reporting or consolidation.                                                 |
|  12 | Country-specific proration rules can be applied.                                                                     |
|  13 | Country-specific overtime and leave payroll treatment can be applied.                                                |
|  14 | Country-specific statutory reports can be generated.                                                                 |
|  15 | Country-specific tax reports can be generated.                                                                       |
|  16 | Country-specific contribution reports can be generated.                                                              |
|  17 | Local payslip format displays required country-specific statutory fields.                                            |
|  18 | Country-specific bank payment or vendor export files can be generated where enabled.                                 |
|  19 | Finalized payroll stores the country rule version used for calculation.                                              |
|  20 | Cross-country payroll cost can be reported by country, legal entity, currency, pay group, and period.                |
|  21 | Unauthorized users cannot modify statutory payroll rules.                                                            |
|  22 | Every country payroll configuration, rule change, statutory calculation, and filing export creates an audit event.   |

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
| HRM-MCP-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-MCP-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-MCP-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-payroll-compensation-multi-country-payroll typecheck`
2. `pnpm --filter @repo/features-payroll-compensation-multi-country-payroll lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
