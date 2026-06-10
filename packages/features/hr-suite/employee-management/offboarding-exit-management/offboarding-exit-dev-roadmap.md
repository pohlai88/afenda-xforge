# Offboarding Exit Management Dev Roadmap

## Purpose

This roadmap translates the current architecture requirements into a delivery sequence that matches the HR suite implementation guidance: audit first, use the compliance-regulatory-tracking package as the primary implementation pattern, and ship one complete vertical slice at a time.

## Current Package Reality

- The package exists, but it is still a placeholder implementation.
- `src/actions.ts` only creates and updates a generic in-memory record with `id`, `name`, and `status`.
- `src/queries.ts` only lists and fetches those generic records from a `Map`.
- `src/contract.ts` contains preliminary permissions, route constants, and audit action names, but not real domain contracts.
- The package does not yet show evidence of domain schema ownership, repository persistence, policy enforcement, projectors, API routes, tests, or requirement coverage.

## Delivery Rules

- Follow the compliance-regulatory-tracking package structure unless the offboarding package now has a stronger local convention.
- Do not duplicate ownership from payroll, leave, attendance, assets, IAM, documents, recruitment, or employee master data.
- Store owned offboarding facts and derive dashboards, readiness, and summaries via projectors/read models.
- Every slice must include schema/contracts, repository changes, action/query surface, audit handling, tests, and documentation evidence before it is marked done.

## Slice Plan

### Slice 1. Foundation and ownership baseline

Goal: Replace the placeholder package shape with the mature package structure and establish source-of-truth boundaries.

Deliver:
- Audit current package and the compliance reference package.
- Introduce package-level files and folders expected by the standard pattern:
  `schema.ts`, `repository.ts`, `policy.ts`, `execution.ts`, `projector.ts`, `contracts/`, `queries/`, `registry/`.
- Define feature identity, bounded context, permissions, route contracts, metadata, manifest, and requirement coverage scaffolding.
- Write the explicit ownership matrix for:
  exit case facts, approvals, checklist tasks, interview records, handover records, asset recovery references, access revocation references, settlement blockers/readiness references, closure, rehire eligibility, and audit events.

Acceptance focus:
- Package structure matches the current HR suite pattern.
- Placeholder CRUD contracts are removed or isolated behind real domain naming.

### Slice 2. Exit case initiation

Goal: Implement the core exit case entity and the ability to open an offboarding case.

Deliver:
- Domain schema for exit case facts:
  exit type, exit reason, effective separation date, notice dates, last working date, initiator, employee/company references, risk/legal routing markers.
- Repository persistence for exit cases and audit events.
- Commands such as `openOffboardingCase` and `updateOffboardingCase`.
- Queries such as `listOffboardingCases` and `getOffboardingCaseById`.
- Projected case summary read model with proper redaction of sensitive fields.
- API route/callable server functions and tests.

Requirements targeted:
- `HRM-OFF-001` to `HRM-OFF-004`, partial `HRM-OFF-025`, partial `HRM-OFF-028`.

### Slice 3. Approval workflow and decision audit

Goal: Support approval routing and approval outcomes without taking over workflow ownership outside the feature boundary.

Deliver:
- Approval step/reference schema tied to exit type, employee profile, legal entity, department, and risk level.
- Commands to submit, approve, reject, and reopen approval steps.
- Policy enforcement for read/write/sensitive actions.
- Audit events for submission, approval, rejection, escalation, and resubmission.
- Read models for approval status and blockers.

Requirements targeted:
- `HRM-OFF-005`, partial `HRM-OFF-025`, partial `HRM-OFF-028`.

### Slice 4. Checklist generation and task execution

Goal: Make offboarding operational through generated checklist tasks and task completion tracking.

Deliver:
- Checklist template/reference model and owned task instance model.
- Automatic task generation on case initiation or approval milestone.
- Task owner, due date, status, evidence, and blocker support.
- Commands for assign, complete, block, unblock, waive where policy allows.
- Queries/projectors for task board and overdue status.

Requirements targeted:
- `HRM-OFF-006`, `HRM-OFF-007`, `HRM-OFF-008`, partial `HRM-OFF-027`, partial `HRM-OFF-028`.

### Slice 5. Exit interview and handover

Goal: Capture the employee exit conversation and operational knowledge transfer.

Deliver:
- Exit interview schedule, questionnaire, feedback, and outcome schema.
- Handover checklist/evidence schema.
- Commands to schedule interview, record feedback, assign handover items, and record handover completion.
- Sensitive-field masking/redaction tests for exit feedback.

Requirements targeted:
- `HRM-OFF-009`, `HRM-OFF-010`, `HRM-OFF-011`, partial `HRM-OFF-025`, partial `HRM-OFF-028`.

### Slice 6. Asset recovery and access revocation

Goal: Coordinate two core clearance areas while keeping external systems as references, not duplicated masters.

Deliver:
- Asset recovery records that reference assigned assets from the owning asset domain.
- Access revocation records that reference accounts/access points from IAM/security owners.
- Commands to create recovery/revocation tasks and record outcomes.
- Status support for returned, damaged, missing, waived, deducted, revoked, pending, failed, and verified states where needed.
- Queries/projectors for outstanding asset/access clearance.

Requirements targeted:
- `HRM-OFF-012` to `HRM-OFF-016`, partial `HRM-OFF-017`, partial `HRM-OFF-028`.

### Slice 7. Clearance checks and payroll settlement readiness

Goal: Aggregate clearance blockers and expose payroll-facing readiness without owning payroll calculation.

Deliver:
- Fact model for blockers across leave, attendance, claims, advances, loans, deductions, and company property references.
- Commands to add, resolve, and return settlement blockers.
- Projected settlement readiness model for payroll consumers.
- Clear package boundary that payroll computes final settlement while offboarding only exposes readiness/blockers.

Requirements targeted:
- `HRM-OFF-017`, `HRM-OFF-018`, `HRM-OFF-019`, partial `HRM-OFF-028`.

### Slice 8. Exit documents, status closure, and rehire eligibility

Goal: Close the case formally and preserve post-employment outcomes.

Deliver:
- Document link/reference model for resignation acceptance, termination letters, clearance forms, release letters, and experience letters.
- Commands to link documents, close the case, classify rehire eligibility, and record closure notes.
- Employment status transition integration point.
- Historical retention-safe read models for closed cases.

Requirements targeted:
- `HRM-OFF-020`, `HRM-OFF-021`, `HRM-OFF-023`, `HRM-OFF-024`, partial `HRM-OFF-028`.

### Slice 9. Vacancy trigger, dashboarding, notifications, and operational reporting

Goal: Add operational visibility and downstream signals after the core process is reliable.

Deliver:
- Vacancy/replacement trigger reference flow.
- Dashboard and summary projectors by status, exit type, department, manager, legal entity, and last working date.
- Notification hooks/events for pending, overdue, blocked, and completed tasks.
- Registry and route coverage updates for reporting surfaces.

Requirements targeted:
- `HRM-OFF-022`, `HRM-OFF-026`, `HRM-OFF-027`.

### Slice 10. Hardening, coverage closure, and architecture evidence

Goal: Close the gap between implemented code and documented requirement status.

Deliver:
- Full requirement-to-code evidence mapping.
- Redaction, authorization, tenant/company scoping, and audit regression tests.
- Route-level and projector-level test completion.
- Architecture document update with exact evidence links only after code/tests exist.
- Validation pass across package, database, and API dependents.

Requirements targeted:
- Completion pass for `HRM-OFF-001` to `HRM-OFF-028`.

## Recommended Implementation Order Inside Each Slice

1. Database schema, if needed.
2. `src/schema.ts`.
3. Public contracts.
4. Repository.
5. Policy and execution helpers.
6. Actions.
7. Queries.
8. Projectors/read models.
9. API route or callable server surface.
10. Tests.
11. Architecture/doc evidence update.

## Validation Baseline

Run targeted checks after each slice:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter api typecheck
```

If a slice changes database schema:

```powershell
pnpm --filter @repo/database db:generate
```

## Recommended First Execution Slice

Start with Slice 1 and Slice 2 only. That creates the package foundation and a real offboarding case lifecycle before tasking, approvals, clearance, and reporting are layered on top.
