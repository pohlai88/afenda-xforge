# Salary Benchmarking & Surveys
## Business Definition
**Salary Benchmarking & Surveys is the HRM function that compares internal employee compensation against external market salary data, salary surveys, industry benchmarks, job families, job levels, locations, and compensation percentiles to support competitive pay decisions and identify internal pay equity gaps.**

---
# Salary Benchmarking & Surveys Includes

| Area                                 | What It Covers                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Market Salary Data**               | External salary survey data, market pay range, industry benchmark, compensation survey reference |
| **Job Benchmarking**                 | Job matching, job family mapping, job level mapping, benchmark role comparison                   |
| **Salary Range Comparison**          | Internal salary compared against market minimum, midpoint, median, and maximum                   |
| **Percentile Analysis**              | Market 25th percentile, 50th percentile, 75th percentile, 90th percentile                        |
| **Compa-Ratio Analysis**             | Employee salary compared against internal midpoint or market midpoint                            |
| **Market Ratio Analysis**            | Employee salary compared against external market benchmark                                       |
| **Pay Equity Analysis**              | Internal pay gap, grade-level pay gap, role-based pay gap, location-based pay gap                |
| **Internal Equity Review**           | Comparison between employees in similar roles, grades, departments, and locations                |
| **Salary Band Review**               | Existing salary range alignment with market data                                                 |
| **Geographic Pay Comparison**        | Salary comparison by country, state, city, region, or work location                              |
| **Industry Comparison**              | Benchmarking against similar industry, company size, revenue, or workforce segment               |
| **Compensation Competitiveness**     | Below market, at market, above market, premium pay positioning                                   |
| **Market Adjustment Recommendation** | Suggested correction for employees below target market range                                     |
| **Survey Data Management**           | Survey provider, survey year, data source, effective date, confidence level                      |
| **Benchmark Governance**             | Approved benchmark source, benchmark version, benchmark mapping approval                         |
| **Reporting**                        | Market competitiveness report, pay equity report, salary range report, benchmark gap report      |
| **Audit Trail**                      | Benchmark uploaded by, mapped by, reviewed by, approved by, timestamp, source version            |

---
# Salary Benchmarking & Surveys Does Not Include

| Excluded Area                          | Owned By                                       |
| -------------------------------------- | ---------------------------------------------- |
| Employee master profile                | Employee Records Management                    |
| Employee salary master update          | Payroll / Compensation Records                 |
| Payroll calculation                    | Payroll Processing                             |
| Payroll finalization                   | Payroll Processing                             |
| Salary increase approval               | Compensation Planning & Modeling               |
| Bonus calculation                      | Bonus & Incentive Management                   |
| Benefits enrollment                    | Benefits Administration                        |
| Expense reimbursement                  | Expense Reimbursement                          |
| Performance review scoring             | Performance Management                         |
| Job architecture ownership             | Job / Position Management                      |
| Organization hierarchy                 | Organizational Chart & Hierarchy               |
| Finance budget approval                | Finance / Budgeting                            |
| External survey provider ownership     | External Survey Provider                       |
| Legal pay discrimination investigation | Legal / Compliance                             |
| Final compensation decision            | Compensation Planning & Modeling / HR Approval |

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
# Salary Benchmarking & Surveys Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Salary Benchmarking & Surveys** | Compares internal compensation against external market salary data, survey benchmarks, job families, job levels, locations, and compensation percentiles to assess pay competitiveness, review salary ranges, identify market gaps, detect internal pay equity issues, support market adjustment recommendations, and maintain benchmark audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-SBS-001** | System shall maintain external salary survey and benchmark data.                                                                                                 |
| **HRM-SBS-002** | System shall support salary survey data by provider, survey year, industry, country, location, job family, job level, and currency.                              |
| **HRM-SBS-003** | System shall support benchmark salary values including minimum, maximum, median, average, and percentile values.                                                 |
| **HRM-SBS-004** | System shall support market percentiles including 25th, 50th, 75th, and 90th percentile where available.                                                         |
| **HRM-SBS-005** | System shall support mapping internal jobs to external benchmark jobs.                                                                                           |
| **HRM-SBS-006** | System shall support mapping internal grades or levels to external benchmark levels.                                                                             |
| **HRM-SBS-007** | System shall support benchmark mapping by legal entity, country, location, job family, job title, grade, and employment category.                                |
| **HRM-SBS-008** | System shall require approval for benchmark job mapping changes.                                                                                                 |
| **HRM-SBS-009** | System shall compare employee base salary against selected market benchmark.                                                                                     |
| **HRM-SBS-010** | System shall compare total cash compensation against selected market benchmark.                                                                                  |
| **HRM-SBS-011** | System shall compare total compensation package against selected market benchmark where benefit and variable pay data is available.                              |
| **HRM-SBS-012** | System shall calculate compa-ratio against internal salary range midpoint.                                                                                       |
| **HRM-SBS-013** | System shall calculate market ratio against selected market benchmark midpoint or median.                                                                        |
| **HRM-SBS-014** | System shall classify compensation position as below market, at market, above market, or outlier.                                                                |
| **HRM-SBS-015** | System shall identify employees paid below configured market target threshold.                                                                                   |
| **HRM-SBS-016** | System shall identify employees paid above configured market range threshold.                                                                                    |
| **HRM-SBS-017** | System shall identify internal pay gaps among employees in similar job, grade, department, location, or employment category.                                     |
| **HRM-SBS-018** | System shall support pay equity analysis by job family, grade, department, location, tenure, and performance rating.                                             |
| **HRM-SBS-019** | System shall support salary range review using market benchmark data.                                                                                            |
| **HRM-SBS-020** | System shall recommend salary band adjustment indicators based on market movement.                                                                               |
| **HRM-SBS-021** | System shall generate market adjustment recommendation references for Compensation Planning & Modeling.                                                          |
| **HRM-SBS-022** | System shall support benchmark data versioning by survey year, provider, and effective date.                                                                     |
| **HRM-SBS-023** | System shall preserve benchmark version used for each compensation analysis.                                                                                     |
| **HRM-SBS-024** | System shall support currency conversion reference for cross-country benchmark comparison.                                                                       |
| **HRM-SBS-025** | System shall restrict access to benchmark and compensation comparison data based on role and permission.                                                         |
| **HRM-SBS-026** | System shall provide salary benchmarking reports by job, grade, department, legal entity, country, location, manager, and market position.                       |
| **HRM-SBS-027** | System shall provide pay equity reports by job family, grade, department, location, employment category, and compensation range.                                 |
| **HRM-SBS-028** | System shall maintain audit trail for survey upload, benchmark mapping, comparison calculation, pay gap review, recommendation generation, and approval actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                 |
| --: | ----------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Salary survey data can be uploaded or maintained with provider, survey year, country, location, industry, job family, and currency. |
|   2 | Benchmark data can store salary minimum, midpoint, median, maximum, average, and percentile values.                                 |
|   3 | Internal jobs can be mapped to external benchmark jobs.                                                                             |
|   4 | Internal grades or levels can be mapped to external benchmark levels.                                                               |
|   5 | Benchmark mapping changes require authorization or approval.                                                                        |
|   6 | Employee salary can be compared against selected market benchmark.                                                                  |
|   7 | Employee total cash compensation can be compared against selected market benchmark.                                                 |
|   8 | Total compensation comparison can include base salary, allowances, bonus reference, incentives, and benefits where available.       |
|   9 | System calculates compa-ratio against internal salary midpoint.                                                                     |
|  10 | System calculates market ratio against external benchmark midpoint or median.                                                       |
|  11 | System classifies employees as below market, at market, above market, or outlier based on configured thresholds.                    |
|  12 | Employees below target market range can be flagged.                                                                                 |
|  13 | Employees above market range can be flagged for review.                                                                             |
|  14 | Internal pay gaps can be identified by job, grade, department, location, tenure, and employment category.                           |
|  15 | Salary range competitiveness can be reviewed using market benchmark data.                                                           |
|  16 | Market movement can generate salary band adjustment indicators.                                                                     |
|  17 | Market adjustment recommendation reference can be sent to Compensation Planning & Modeling.                                         |
|  18 | Benchmark data version used for analysis is preserved.                                                                              |
|  19 | Cross-country benchmark comparison can reference currency conversion.                                                               |
|  20 | Benchmarking reports can be generated by job, grade, department, legal entity, country, location, and market position.              |
|  21 | Pay equity reports can be generated by job family, grade, department, location, and employment category.                            |
|  22 | Unauthorized users cannot view restricted salary benchmarking and pay equity data.                                                  |
|  23 | Every survey upload, benchmark mapping, analysis, recommendation, and approval creates an audit event.                              |

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
| HRM-SBS-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-SBS-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-SBS-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-payroll-compensation-salary-benchmarking-survey typecheck`
2. `pnpm --filter @repo/features-payroll-compensation-salary-benchmarking-survey lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
