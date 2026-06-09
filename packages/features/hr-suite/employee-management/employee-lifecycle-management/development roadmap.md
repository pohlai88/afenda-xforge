# Employee Lifecycle Management Development Roadmap

This roadmap turns the employee lifecycle architecture and the HR suite implementation advice into a 10-slice delivery plan.

## Working Assumptions

- Employee lifecycle owns lifecycle stages, state transitions, workflow orchestration, reminders, and audit history.
- Employee master data remains owned by employee records.
- Compliance tracking, payroll, leave, attendance, IAM, and offboarding stay as downstream or adjacent domains.
- The compliance-regulatory-tracking package is the implementation pattern to mirror for package shape, contracts, repository, actions, queries, projectors, and tests.
- Build one vertical slice at a time and do not mark a slice done until code, tests, callable surface, and documentation evidence all exist.

## 10 Slices

| Slice | Scope | Main Deliverables | Done When |
| --- | --- | --- | --- |
| 1. Package foundation | Replace the scaffold with a real employee lifecycle package structure. Define feature identity, manifest, metadata, permissions, route contracts, bounded context, and the public contract barrel. | `schema.ts`, `contract.ts`, `manifest.ts`, `metadata.ts`, `index.ts`, route contracts, permission contracts, capability map, requirement coverage map. | The package exports a stable feature identity and the domain boundaries are explicit. |
| 2. Lifecycle state model | Define the canonical lifecycle stages and the transition rules that govern them. Model effective-dated changes, current stage, historical stage events, and invalid-transition rejection. | Stage enum/schema, transition schema, history model, validation helpers, audit event catalog for state changes. | The package can represent a worker’s current lifecycle state and preserve a queryable transition history. |
| 3. Repository backbone | Add the persistence layer that stores lifecycle facts and audit history with tenant and company scoping. Support file-backed test mode first, then database-backed persistence if the package needs it. | Repository state model, load/save/mutate helpers, ID generation, scope handling, reset hooks, persistence adapters. | Lifecycle facts can be saved, reloaded, and tested without losing history or scope isolation. |
| 4. Preboarding and onboarding | Implement hire-triggered preboarding and onboarding flows. Include onboarding tasks, checklist completion, document/policy acknowledgment references, and activation readiness. | Onboarding commands, task generation, onboarding status read model, notifications/reminders, audit entries. | A worker can enter onboarding, complete required tasks, and transition into active employment. |
| 5. Probation and confirmation | Implement probation tracking, review triggers, extension handling, and confirmation approval. Capture review outcome, approval reference, and status updates. | Probation commands, review dates, outcome records, confirmation workflow, status transition rules, audit trail. | Probation can end in confirmation, extension, or a documented adverse outcome. |
| 6. Movement and org changes | Implement promotion, transfer, demotion, job change, department change, location change, and manager/reporting-line updates. | Movement commands, assignment history, reporting-line change records, downstream sync events, audit metadata. | Active employees can move between roles and org structures with a full change history. |
| 7. Contract lifecycle | Implement contract start, renewal, expiry review, and renewal reminders for fixed-term or expiring employment arrangements. | Contract metadata, expiry calendar read model, renewal workflow, reminder hooks, audit events. | Contract expiry is visible early enough to support renewal review and action. |
| 8. Suspension and hold | Implement suspension and hold states for investigations or temporary employment restrictions. Capture reason, effective date, authorization reference, and resolution path. | Suspension commands, hold/release rules, approval metadata, restricted-state handling, audit trail. | Suspension can be applied, tracked, and reversed or resolved with evidence. |
| 9. Exit lifecycle | Implement resignation, termination, retirement, notice period tracking, last working date, and offboarding trigger handoff. | Exit initiation commands, approval/decision records, notice tracking, offboarding trigger events, archival state. | Every exit path produces a traceable lifecycle record and an offboarding handoff. |
| 10. Read models, API, and validation | Expose the package through queries, projectors, server helpers, and API routes. Finish with permissions, sensitive-field redaction, tests, and architecture evidence updates. | List/get queries, overview/history projections, API handlers, policy checks, test suite, documentation updates. | The feature is callable, queryable, test-covered, and documented with evidence for each requirement. |

## Recommended Delivery Order

1. Build the package foundation first so every later slice has the same public shape.
2. Lock the lifecycle state model early so the rest of the workflow logic uses one transition system.
3. Add persistence before workflow depth so later slices can rely on durable facts and audit history.
4. Deliver the major lifecycle branches one at a time: onboarding, probation, movement, contract, suspension, exit.
5. Finish with read models, APIs, tests, and documentation so the implementation can be validated end to end.

## Validation Gate

Use a narrow validation gate after each slice and a broader one before merging:

```powershell
pnpm --filter @repo/features-employee-management-employee-lifecycle-management typecheck
pnpm --filter @repo/features-employee-management-employee-lifecycle-management lint
pnpm --filter @repo/features-employee-management-employee-lifecycle-management test
```

If the slice adds database persistence, also run the relevant database generation and database package checks used by the repo.
