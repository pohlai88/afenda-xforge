# Leave & Attendance Management

## Definition

**Leave & Attendance Management is the HRM function that tracks employee attendance, manages leave entitlement, leave applications, leave balances, attendance exceptions, absence records, approval workflows, policy enforcement, and payroll-ready attendance outcomes.**

---

# Implementation Status

**Status:** Seq 0 foundation + Seq 1 (HRM-LAM-003) + Seq 2 (HRM-LAM-004) + Seq 3 (HRM-LAM-005) + Seq 4 (HRM-LAM-006 + HRM-LAM-019) + Seq 5 (HRM-LAM-007) + Seq 6 (HRM-LAM-008) + Seq 7 (HRM-LAM-009–011) + Seq 8 (HRM-LAM-012–013) + Seq 9 (HRM-LAM-014–015) + Seq 10 (HRM-LAM-016–018) + Seq 11 (HRM-LAM-001–002) + Seq 12 (HRM-LAM-022) + Seq 13 (HRM-LAM-023–024) + Seq 14 (HRM-LAM-021) + Seq 15 (HRM-LAM-020) + Seq 16 (HRM-LAM-025) + Seq 17 (HRM-LAM-026) + Seq 18 (HRM-LAM-027) + Seq 19 (HRM-LAM-028) + Seq 20 (HRM-LAM-029) + Seq 21 (HRM-LAM-030) implemented

**Last audited:** 2026-06-10 (full-stack sync pass)

| Full-stack sync (2026-06-10) | Repair |
| --- | --- |
| Sensitive read gates | [`canReadLamAuditTrail`](./src/policy.ts), [`canReadLamReports`](./src/policy.ts), [`canReadLamPayrollReferences`](./src/policy.ts) no longer fall back to generic `canRead`. |
| Data scope | [`resolveLamDataScope`](./src/shared/data-scope.ts) removed catch-all `any capability → company`; company read requires `canRead` paired with explicit read capabilities or company-wide write/sensitive caps. |
| Correction approval | [`requireStrictLamCorrectionApprovalAccess`](./src/execution.ts) on approve/reject; `canWrite` alone cannot approve corrections. |
| Audit catalog | [`leaveMedicalCertificateLinked`](./src/contracts/audit.contract.ts) removed from attendance event group (leave-applications only). |
| Client route paths | [`hrLamRoutePaths`](./src/contracts/domain.contract.ts) extended to all 19 LAM API route groups. |
| API integration | Attendance routes use local [`attendance/_lib/mutation-response.ts`](../../../../../apps/api/app/api/hr/attendance/_lib/mutation-response.ts) and [`notify-lam-events.ts`](../../../../../apps/api/app/api/hr/attendance/_lib/notify-lam-events.ts); entitlement calculate returns **403** when read context is denied (apply route handles persist). |
| Scaffold removal | In-memory scaffold CRUD (`LeaveAttendanceManagementRecord`, `leaveAttendanceManagementStore`, `leaveAttendanceManagementExecutionSurface`) removed from [`server.ts`](./src/server.ts), [`index.ts`](./src/index.ts), and [`contract.ts`](./src/contract.ts); domain mutations/queries remain on `/server`. |
| API context tests | [`apps/api/test/hr-lam-context.test.ts`](../../../../../apps/api/test/hr-lam-context.test.ts) covers leave/attendance header parsing for step identity, HR fallback delegation, scoped employee, team, capability injection, and [`createLamNotificationReadContext`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) for post-decision notification reads. |

| Area | Evidence |
| --- | --- |
| Feature contracts and schemas | [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts), [`src/contracts/query.contract.ts`](./src/contracts/query.contract.ts), [`src/contracts/command.contract.ts`](./src/contracts/command.contract.ts) |
| Mutation execution kernel | [`src/execution.ts`](./src/execution.ts), [`src/policy.ts`](./src/policy.ts) |
| Leave balance shared formula | [`src/shared/balance.ts`](./src/shared/balance.ts) |
| Leave type configuration actions | [`src/actions/leave-types.action.ts`](./src/actions/leave-types.action.ts) |
| Leave type configuration queries | [`src/queries/leave-types.query.ts`](./src/queries/leave-types.query.ts) |
| Leave entitlement rule actions | [`src/actions/leave-entitlement-rules.action.ts`](./src/actions/leave-entitlement-rules.action.ts) |
| Leave entitlement rule queries | [`src/queries/leave-entitlement-rules.query.ts`](./src/queries/leave-entitlement-rules.query.ts) |
| Leave entitlement calculation projector | [`src/projector/entitlement.ts`](./src/projector/entitlement.ts) |
| Leave entitlement calculation query | [`src/queries/leave-entitlement-calculation.query.ts`](./src/queries/leave-entitlement-calculation.query.ts) |
| Leave entitlement calculation action | [`src/actions/leave-entitlement-calculation.action.ts`](./src/actions/leave-entitlement-calculation.action.ts) |
| Leave balance ledger queries | [`src/queries/leave-balances.query.ts`](./src/queries/leave-balances.query.ts) |
| Leave balance adjustment action | [`src/actions/leave-balance-adjustment.action.ts`](./src/actions/leave-balance-adjustment.action.ts) |
| Carry-forward projector | [`src/projector/carry-forward.ts`](./src/projector/carry-forward.ts) |
| Carry-forward rule actions | [`src/actions/leave-carry-forward-rules.action.ts`](./src/actions/leave-carry-forward-rules.action.ts) |
| Carry-forward rule queries | [`src/queries/leave-carry-forward-rules.query.ts`](./src/queries/leave-carry-forward-rules.query.ts) |
| Carry-forward processing action | [`src/actions/leave-balance-carry-forward.action.ts`](./src/actions/leave-balance-carry-forward.action.ts) |
| Leave application submit action | [`src/actions/leave-applications.action.ts`](./src/actions/leave-applications.action.ts) |
| Leave application queries | [`src/queries/leave-applications.query.ts`](./src/queries/leave-applications.query.ts) |
| Leave document reference actions | [`src/actions/leave-documents.action.ts`](./src/actions/leave-documents.action.ts) |
| Leave document queries | [`src/queries/leave-documents.query.ts`](./src/queries/leave-documents.query.ts) |
| Leave application policy projector | [`src/projector/application-policy.ts`](./src/projector/application-policy.ts) |
| Leave blackout period actions | [`src/actions/leave-blackout-periods.action.ts`](./src/actions/leave-blackout-periods.action.ts) |
| Leave blackout period queries | [`src/queries/leave-blackout-periods.query.ts`](./src/queries/leave-blackout-periods.query.ts) |
| Leave approval routing projector | [`src/projector/approval-routing.ts`](./src/projector/approval-routing.ts) |
| Leave approval route actions | [`src/actions/leave-approval-routes.action.ts`](./src/actions/leave-approval-routes.action.ts) |
| Leave approval route queries | [`src/queries/leave-approval-routes.query.ts`](./src/queries/leave-approval-routes.query.ts) |
| Leave application decision actions | [`src/actions/leave-application-decisions.action.ts`](./src/actions/leave-application-decisions.action.ts) |
| Leave application lifecycle actions | [`src/actions/leave-application-lifecycle.action.ts`](./src/actions/leave-application-lifecycle.action.ts) |
| Attendance record actions | [`src/actions/attendance-records.action.ts`](./src/actions/attendance-records.action.ts) |
| Attendance record queries | [`src/queries/attendance-records.query.ts`](./src/queries/attendance-records.query.ts) |
| Attendance summary projector | [`src/projector/attendance-summary.ts`](./src/projector/attendance-summary.ts) |
| Attendance summary queries | [`src/queries/attendance-summary.query.ts`](./src/queries/attendance-summary.query.ts) |
| Attendance summary export action | [`src/actions/attendance-summary.action.ts`](./src/actions/attendance-summary.action.ts) |
| Leave report projector | [`src/projector/leave-report.ts`](./src/projector/leave-report.ts) |
| Leave report queries | [`src/queries/leave-report.query.ts`](./src/queries/leave-report.query.ts) |
| Leave report export action | [`src/actions/leave-report.action.ts`](./src/actions/leave-report.action.ts) |
| Audit trail query | [`src/queries/audit.query.ts`](./src/queries/audit.query.ts), [`src/projector/audit-trail.ts`](./src/projector/audit-trail.ts) |
| Unpaid leave payroll reference projector | [`src/projector/unpaid-leave-payroll-references.ts`](./src/projector/unpaid-leave-payroll-references.ts) |
| Attendance payroll reference projector | [`src/projector/attendance-payroll-references.ts`](./src/projector/attendance-payroll-references.ts) |
| Payroll reference aggregator projector | [`src/projector/payroll-references.ts`](./src/projector/payroll-references.ts) |
| Payroll reference queries | [`src/queries/payroll-references.query.ts`](./src/queries/payroll-references.query.ts) |
| Payroll reference export action | [`src/actions/payroll-references.action.ts`](./src/actions/payroll-references.action.ts) |
| Employee data scope enforcement | [`src/shared/data-scope.ts`](./src/shared/data-scope.ts), [`src/registry/persona-capabilities.ts`](./src/registry/persona-capabilities.ts) |
| Notification contracts and projector | [`src/contracts/notification.contract.ts`](./src/contracts/notification.contract.ts), [`src/projector/notifications.ts`](./src/projector/notifications.ts) |
| Notification audit and overdue processing | [`src/actions/notifications.action.ts`](./src/actions/notifications.action.ts), [`src/queries/overdue-approvals.query.ts`](./src/queries/overdue-approvals.query.ts) |
| Notification API dispatch (post-commit) | [`apps/api/app/api/hr/leave/_lib/dispatch-lam-notifications.ts`](../../../../../apps/api/app/api/hr/leave/_lib/dispatch-lam-notifications.ts), [`apps/api/app/api/hr/leave/_lib/notify-lam-events.ts`](../../../../../apps/api/app/api/hr/leave/_lib/notify-lam-events.ts) |
| Attendance exception projector | [`src/projector/attendance-exceptions.ts`](./src/projector/attendance-exceptions.ts) |
| Attendance exception queries | [`src/queries/attendance-exceptions.query.ts`](./src/queries/attendance-exceptions.query.ts) |
| Shared leave application balance helpers | [`src/shared/leave-application-balance.ts`](./src/shared/leave-application-balance.ts) |
| Shared query helpers | [`src/queries/shared.ts`](./src/queries/shared.ts) |
| Database persistence boundary | [`src/repository.ts`](./src/repository.ts), [`packages/database/schema.ts`](../../../../../packages/database/schema.ts) |
| HR LAM permissions shell | [`packages/permissions/catalog.ts`](../../../../../packages/permissions/catalog.ts), [`src/registry/capability.ts`](./src/registry/capability.ts) |
| Requirement coverage registry | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts) |
| Generated migrations | [`packages/database/drizzle/0010_lam_foundation.sql`](../../../../../packages/database/drizzle/0010_lam_foundation.sql), [`packages/database/drizzle/0011_lam_carry_forward_rules.sql`](../../../../../packages/database/drizzle/0011_lam_carry_forward_rules.sql), [`packages/database/drizzle/0012_lam_leave_documents.sql`](../../../../../packages/database/drizzle/0012_lam_leave_documents.sql), [`packages/database/drizzle/0013_lam_leave_application_validation.sql`](../../../../../packages/database/drizzle/0013_lam_leave_application_validation.sql), [`packages/database/drizzle/0014_lam_approval_workflow.sql`](../../../../../packages/database/drizzle/0014_lam_approval_workflow.sql), [`packages/database/drizzle/0015_lam_leave_application_lifecycle.sql`](../../../../../packages/database/drizzle/0015_lam_leave_application_lifecycle.sql), [`packages/database/drizzle/0016_lam_attendance_corrections.sql`](../../../../../packages/database/drizzle/0016_lam_attendance_corrections.sql), [`packages/database/drizzle/0018_lam_attendance_correction_pending_unique.sql`](../../../../../packages/database/drizzle/0018_lam_attendance_correction_pending_unique.sql), [`packages/database/drizzle/0019_lam_attendance_date_calendar_day.sql`](../../../../../packages/database/drizzle/0019_lam_attendance_date_calendar_day.sql), [`packages/database/drizzle/0021_lam_company_attendance_settings.sql`](../../../../../packages/database/drizzle/0021_lam_company_attendance_settings.sql) |
| HTTP API routes | [`apps/api/app/api/hr/attendance/attendance-records/`](../../../../../apps/api/app/api/hr/attendance/attendance-records/), [`apps/api/app/api/hr/attendance/attendance-exceptions/`](../../../../../apps/api/app/api/hr/attendance/attendance-exceptions/), [`apps/api/app/api/hr/attendance/attendance-corrections/`](../../../../../apps/api/app/api/hr/attendance/attendance-corrections/), [`apps/api/app/api/hr/attendance/attendance-settings/`](../../../../../apps/api/app/api/hr/attendance/attendance-settings/), [`apps/api/app/api/hr/attendance/attendance-summary/`](../../../../../apps/api/app/api/hr/attendance/attendance-summary/), [`apps/api/app/api/hr/leave/leave-report/`](../../../../../apps/api/app/api/hr/leave/leave-report/), [`apps/api/app/api/hr/leave/audit-trail/`](../../../../../apps/api/app/api/hr/leave/audit-trail/), [`apps/api/app/api/hr/leave/payroll-references/`](../../../../../apps/api/app/api/hr/leave/payroll-references/), [`apps/api/app/api/hr/leave/leave-types/`](../../../../../apps/api/app/api/hr/leave/leave-types/), [`apps/api/app/api/hr/leave/leave-entitlement-rules/`](../../../../../apps/api/app/api/hr/leave/leave-entitlement-rules/), [`apps/api/app/api/hr/leave/leave-entitlements/`](../../../../../apps/api/app/api/hr/leave/leave-entitlements/), [`apps/api/app/api/hr/leave/leave-balances/`](../../../../../apps/api/app/api/hr/leave/leave-balances/), [`apps/api/app/api/hr/leave/leave-carry-forward-rules/`](../../../../../apps/api/app/api/hr/leave/leave-carry-forward-rules/), [`apps/api/app/api/hr/leave/leave-applications/`](../../../../../apps/api/app/api/hr/leave/leave-applications/), [`apps/api/app/api/hr/leave/leave-documents/`](../../../../../apps/api/app/api/hr/leave/leave-documents/), [`apps/api/app/api/hr/leave/leave-blackout-periods/`](../../../../../apps/api/app/api/hr/leave/leave-blackout-periods/), [`apps/api/app/api/hr/leave/leave-approval-routes/`](../../../../../apps/api/app/api/hr/leave/leave-approval-routes/), decision and lifecycle endpoints under [`leave-applications/[applicationId]/`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/) (`approve`, `reject`, `return`, `clarify`, `route`, `cancel`, `amend`) |
| Verification tests | [`test/leave-attendance-management-foundation.test.ts`](./test/leave-attendance-management-foundation.test.ts), [`test/leave-attendance-management-attendance-records.test.ts`](./test/leave-attendance-management-attendance-records.test.ts), [`test/leave-attendance-management-attendance-exceptions.test.ts`](./test/leave-attendance-management-attendance-exceptions.test.ts), [`test/leave-attendance-management-attendance-summary.test.ts`](./test/leave-attendance-management-attendance-summary.test.ts), [`test/leave-attendance-management-leave-report.test.ts`](./test/leave-attendance-management-leave-report.test.ts), [`test/leave-attendance-management-audit-trail.test.ts`](./test/leave-attendance-management-audit-trail.test.ts), [`test/leave-attendance-management-unpaid-leave-payroll.test.ts`](./test/leave-attendance-management-unpaid-leave-payroll.test.ts), [`test/leave-attendance-management-payroll-integration.test.ts`](./test/leave-attendance-management-payroll-integration.test.ts), [`test/leave-attendance-management-permission-enforcement.test.ts`](./test/leave-attendance-management-permission-enforcement.test.ts), [`test/leave-attendance-management-notifications.test.ts`](./test/leave-attendance-management-notifications.test.ts), [`test/leave-attendance-management-leave-types.test.ts`](./test/leave-attendance-management-leave-types.test.ts), [`test/leave-attendance-management-leave-entitlement-rules.test.ts`](./test/leave-attendance-management-leave-entitlement-rules.test.ts), [`test/leave-attendance-management-leave-entitlement-calculation.test.ts`](./test/leave-attendance-management-leave-entitlement-calculation.test.ts), [`test/leave-attendance-management-leave-balances.test.ts`](./test/leave-attendance-management-leave-balances.test.ts), [`test/leave-attendance-management-leave-applications.test.ts`](./test/leave-attendance-management-leave-applications.test.ts), [`test/leave-attendance-management-leave-documents.test.ts`](./test/leave-attendance-management-leave-documents.test.ts), [`test/leave-attendance-management-leave-application-validation.test.ts`](./test/leave-attendance-management-leave-application-validation.test.ts), [`test/leave-attendance-management-leave-approval-routing.test.ts`](./test/leave-attendance-management-leave-approval-routing.test.ts), [`test/leave-attendance-management-leave-application-decisions.test.ts`](./test/leave-attendance-management-leave-application-decisions.test.ts), [`test/leave-attendance-management-leave-application-lifecycle.test.ts`](./test/leave-attendance-management-leave-application-lifecycle.test.ts) |

### Verification Summary

1. `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck`
2. `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint`
3. `pnpm --filter @repo/features-time-attendance-leave-attendance-management test`
4. `pnpm --filter @repo/database typecheck`
5. `pnpm --filter @repo/database lint`
6. `pnpm --filter api typecheck`

### Planning Mark

- `Planning status: Seq 21 complete`
- `Implementation status: HRM-LAM-030 verified in code`
- `Next slice: per backlog after LAM group 21`

---

## Slice 21 — Audit Trail (HRM-LAM-030)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-030** | System shall maintain audit trail for leave entitlement, leave application, approval, rejection, cancellation, adjustment, attendance correction, exception handling, and payroll integration. | [`leaveAttendanceManagementAuditEvents`](./src/contracts/audit.contract.ts), [`createLamMutationAuditEvent`](./src/execution.ts), [`listLamAuditTrailRecords`](./src/queries/audit.query.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-025 | Every leave, attendance, correction, approval, rejection, adjustment, and payroll integration action creates an audit event. | All 19 action modules emit `createLamMutationAuditEvent`; 31 catalog events reachable across attendance, leave config, balance, applications, corrections, payroll export, report export, and notifications. |

| Write-side audit behaviour | Evidence |
| --- | --- |
| Event catalog | 31 events in [`leaveAttendanceManagementAuditEvents`](./src/contracts/audit.contract.ts) grouped by attendance, leave config, balance, applications, integrations. |
| High-risk classification | 14 events in [`leaveAttendanceManagementHighRiskAuditEvents`](./src/contracts/audit.contract.ts). |
| Mutation coverage | Attendance upsert, corrections submit/approve/reject, leave types/rules/balances/applications/documents/decisions/lifecycle, entitlement calculation, carry-forward, payroll/report export, notification enqueue. |
| Action map integrity | [`hrTimeAttendanceLamAuditActions`](./src/contracts/audit.contract.ts) references catalog strings (no phantom event ids). |

| Read-side audit behaviour | Evidence |
| --- | --- |
| Permission gate | [`canReadLamAuditTrail`](./src/policy.ts) + [`readAuditTrailContext`](./src/queries/shared.ts) enforce `hr.lam.audit.read` only (no generic `canRead` bypass). |
| List query | [`listLamAuditTrailRecords`](./src/queries/audit.query.ts) filters by `entityType`, `action`, `actorId`, `entityId`, date range, search; sorts newest first. |
| Sensitive redaction | `before` / `after` stripped when caller lacks `canViewSensitive` or sensitive capabilities. |
| Single-record read | [`getLamAuditTrailRecordById`](./src/queries/audit.query.ts). |
| API | `GET /api/hr/leave/audit-trail`, `GET /api/hr/leave/audit-trail/:auditEventId`. |
| Dependencies | Seq 0 foundation + all prior write slices (mutations must exist before audit trail is meaningful). |
| Tests | [`test/leave-attendance-management-audit-trail.test.ts`](./test/leave-attendance-management-audit-trail.test.ts) (HRM-LAM-030 read path), [`test/leave-attendance-management-audit-emission.test.ts`](./test/leave-attendance-management-audit-emission.test.ts) (AC-025 write-side emission), [`apps/api/test/hr-lam-audit-trail-route.test.ts`](../../../../apps/api/test/hr-lam-audit-trail-route.test.ts) (AC-025 HTTP mutation → audit-trail). |

| Seq 21 review (2026-06-10) | Result |
| --- | --- |
| Write-side completeness | No un-audited production mutations — all domain actions write audit events. |
| AC-025 test evidence | Domain emission matrix + HTTP end-to-end audit-trail retrieval for attendance, approval, adjustment, payroll export, and report export. |
| Read-side gap closed | Audit list/get query + API routes added; `auditRead` capability now enforced on read path. |
| Action map repair | Fixed phantom `hr.lam.notification.enqueue` and `hr.lam.attendance.day.regenerate` strings in `hrTimeAttendanceLamAuditActions`. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Green — 306 pass, 6 skipped (DB integration when Postgres unavailable) |
| `pnpm --filter api typecheck` | Green (2026-06-10) |
| `pnpm --filter api test` | Green — 114 pass (includes AC-025 HTTP audit-trail route tests) |

---

## Slice 20 — Leave & Attendance Reports (HRM-LAM-029)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-029** | System shall provide leave and attendance reports by employee, department, leave type, attendance status, manager, location, legal entity, and period. | [`listLeaveReportEntries`](./src/projector/leave-report.ts), [`listLamLeaveReportRecords`](./src/queries/leave-report.query.ts), [`exportLamLeaveReport`](./src/actions/leave-report.action.ts), extended [`listAttendanceSummaries`](./src/projector/attendance-summary.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-024 | Leave and attendance reports can be generated by employee, department, leave type, attendance status, manager, location, legal entity, and period. | Leave report list/export with `employeeId`, `employeeIds[]`, `leaveTypeId`, `status`, `periodStart`, `periodEnd`; attendance summary extended with `attendanceStatus` and `leaveTypeId`; org dimensions via orchestration-resolved `employeeIds[]`. |

| Report behaviour | Evidence |
| --- | --- |
| Leave report entry | [`lamLeaveReportEntrySchema`](./src/schema.ts) — `totalApplications`, `totalDays`, `daysByType`, `applicationsByStatus` per employee per period. |
| Leave filters | All application statuses (not only approved); calendar-day overlap with period; optional `leaveTypeId` and `status` filters. |
| Attendance summary filters | `attendanceStatus` narrows counted attendance records and employee inclusion (leave-only employees excluded when status filter active); `leaveTypeId` narrows approved leave taken in summary. |
| Permission gate | Same reports read/export capabilities as Seq 16 — [`readReportsContext`](./src/queries/shared.ts), [`requireLamReportsExportAccess`](./src/execution.ts), [`filterByEmployeeDataScope`](./src/shared/data-scope.ts). |
| Export audit | [`exportLamLeaveReport`](./src/actions/leave-report.action.ts) emits [`reportExported`](./src/contracts/audit.contract.ts) with `reportKind: leave_report`. |
| API | `GET /api/hr/leave/leave-report`, `POST /api/hr/leave/leave-report/export`; attendance summary routes unchanged with extended query params. |
| Org dimensions | Department, manager, work location, and legal entity resolved upstream to `employeeIds[]` — by design (same as Seq 16). |
| Dependencies | Seq 16 attendance summary (HRM-LAM-025) + Seq 10 leave applications (HRM-LAM-016). |
| Tests | [`test/leave-attendance-management-leave-report.test.ts`](./test/leave-attendance-management-leave-report.test.ts), extended [`test/leave-attendance-management-attendance-summary.test.ts`](./test/leave-attendance-management-attendance-summary.test.ts), [`apps/api/test/hr-lam-reports-route.test.ts`](../../../../../apps/api/test/hr-lam-reports-route.test.ts) (AC-024 HTTP list/export filters, repeated `employeeIds`, invalid JSON/period guards). |

| Seq 20 review (2026-06-10) | Result |
| --- | --- |
| Architecture vs code audit | No material production gaps — schema, projector, query, action, contracts, API routes, barrels, and tests aligned. |
| Seq 16 extension | Attendance summary query/export contracts and projector thread `attendanceStatus` + `leaveTypeId` without breaking existing consumers. |
| Audit metadata repair | `lamAttendanceSummaryExportBatchSchema` and export action now persist `attendanceStatus` / `leaveTypeId` in batch + `reportExported` metadata (parity with leave report export). |
| Export filter test | Attendance summary export test asserts filtered export + audit metadata for `attendanceStatus`. |
| Attendance status filter repair | [`listAttendanceSummaries`](./src/projector/attendance-summary.ts) excludes employees present only via approved leave when `attendanceStatus` is set. |
| HTTP hardening | Report GET routes return 400 on invalid/missing period; export routes guard malformed JSON; repeated `employeeIds` query params joined in API context. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Green — 306 pass, 6 skipped (DB integration when Postgres unavailable) |
| `pnpm --filter api typecheck` | Green (2026-06-10) |
| `pnpm --filter api test` | Green — 114 pass (includes AC-024 HTTP report route tests) |

---

## Slice 19 — Notifications (HRM-LAM-028)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-028** | System shall notify employees and approvers of submitted, approved, rejected, cancelled, overdue, and returned leave or attendance requests. | [`buildLamLeaveApplicationNotificationIntent`](./src/projector/notifications.ts), [`buildLamAttendanceCorrectionNotificationIntent`](./src/projector/notifications.ts), [`recordLamNotificationEnqueued`](./src/actions/notifications.action.ts), [`notifyLamLeaveApplicationEvent`](../../../../../apps/api/app/api/hr/leave/_lib/notify-lam-events.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| HRM-LAM-028 (workflow notifications) | Employees and approvers receive notifications for leave and attendance workflow events. | Post-commit dispatch on leave submit/approve/reject/return/clarify/cancel and attendance correction submit/approve/reject API routes via `@repo/notifications`. |
| HRM-LAM-028 (overdue notifications) | Overdue pending approvals generate notifications. | [`listLamOverdueApprovalNotifications`](./src/queries/overdue-approvals.query.ts), [`processLamOverdueApprovalNotifications`](./src/actions/notifications.action.ts), `POST /api/hr/leave/leave-applications/overdue-notifications`. |

| Notification event | Trigger | Recipients |
| --- | --- | --- |
| `lam.leave-application.submitted` | Leave application submit | Approvers |
| `lam.leave-application.approved` | Leave approve | Employee |
| `lam.leave-application.rejected` | Leave reject | Employee |
| `lam.leave-application.cancelled` | Leave cancel | Employee (when configured) |
| `lam.leave-application.returned` | Leave return / clarify | Employee |
| `lam.leave-application.overdue` | Pending approval past SLA | Approvers |
| `lam.attendance-correction.submitted` | Correction submit | Approvers |
| `lam.attendance-correction.approved` | Correction approve | Employee |
| `lam.attendance-correction.rejected` | Correction reject | Employee |
| `lam.attendance-correction.overdue` | Pending correction past SLA | Approvers |

| Integration behaviour | Evidence |
| --- | --- |
| Domain notification intents | Pure projector builds title/body/priority/recipient roles without importing `@repo/notifications`. |
| Audit trail | [`lam.notification.enqueued`](./src/contracts/audit.contract.ts) written by [`recordLamNotificationEnqueued`](./src/actions/notifications.action.ts). |
| Post-commit dispatch | API routes call `persistAndDispatchNotifications` after successful mutations; failures do not roll back domain state. |
| Recipient resolution | Orchestration passes `x-lam-employee-user-id`, `x-lam-approver-user-ids`, or `body.notification` with auth user ids (employeeId → userId mapping stays outside LAM). |
| Overdue SLA | Default `DEFAULT_LAM_APPROVAL_OVERDUE_HOURS` (48h); configurable via query/action input. |
| Dependencies | Seq 9–10 leave approval workflow + Seq 13 attendance corrections. |
| Tests | [`test/leave-attendance-management-notifications.test.ts`](./test/leave-attendance-management-notifications.test.ts). |

| Seq 19 review (2026-06-10) | Result |
| --- | --- |
| Production implementation | All 10 notification events implemented and wired post-commit — no production gaps. |
| Test coverage repairs | Added correction rejected/overdue intent assertions, correction overdue query, `processLamOverdueApprovalNotifications` action, and recipient resolution edge cases (empty approvers, missing employee user id). |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Green — 182 pass, 2 skipped (DB integration when Postgres unavailable) |
| `pnpm --filter api typecheck` | Green (2026-06-10) |

---

## Slice 18 — Permission Enforcement (HRM-LAM-027)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-027** | System shall restrict leave and attendance records based on employee, manager, HR, payroll, and auditor permissions. | [`resolveLamDataScope`](./src/shared/data-scope.ts), [`lamPersonaCapabilityPresets`](./src/registry/persona-capabilities.ts), [`filterByEmployeeDataScope`](./src/shared/data-scope.ts), [`requireLamEmployeeMutationScope`](./src/shared/data-scope.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-021 | Employees can view their own leave balance, leave history, and attendance summary. | Self scope via `scopedEmployeeId`; queries filter with [`filterByEmployeeDataScope`](./src/shared/data-scope.ts) on leave applications, balances, attendance records, summaries, payroll references, and documents. HTTP boundary in [`apps/api/test/hr-lam-employee-self-service-route.test.ts`](../../../../../apps/api/test/hr-lam-employee-self-service-route.test.ts) (leave balances, leave history, attendance summary, cross-employee denial, fail-closed without read caps). |
| AC-022 | Managers can view and approve leave and attendance for their team. | Team scope via `teamEmployeeIds` + manager approval/correction capabilities; manager preset excludes HR config write caps. Read scope uses [`resolveLamReadDataScope`](./src/shared/data-scope.ts) to require team ids for manager-facing capabilities unless HR admin elevation is present. HTTP boundary in [`apps/api/test/hr-lam-manager-team-scope-route.test.ts`](../../../../../apps/api/test/hr-lam-manager-team-scope-route.test.ts) (team leave calendar, team attendance exceptions, cross-team denial, fail-closed without team ids). |
| AC-023 | Unauthorized users cannot view or modify restricted leave and attendance records. | Fail-closed read scope ([`resolveLamReadDataScope`](./src/shared/data-scope.ts), [`filterByEmployeeDataScope`](./src/shared/data-scope.ts)); fail-closed **mutation** scope ([`resolveLamDataScope`](./src/shared/data-scope.ts) mirrors manager/operator elevation checks); sensitive gates ([`canReadLamAuditTrail`](./src/policy.ts), [`canReadLamPayrollReferences`](./src/policy.ts), [`canReadLamReports`](./src/policy.ts), [`canReadLamAttendanceCorrections`](./src/policy.ts)); granular write guards ([`requireLamLeaveTypesWriteAccess`](./src/execution.ts), [`requireLamLeaveEntitlementsWriteAccess`](./src/execution.ts), [`requireLamLeaveApplicationsWriteAccess`](./src/execution.ts), [`requireStrictLamApprovalAccess`](./src/execution.ts)); mutation guards ([`requireLamEmployeeMutationScope`](./src/shared/data-scope.ts)); HTTP boundary in [`apps/api/test/hr-lam-unauthorized-access-route.test.ts`](../../../../../apps/api/test/hr-lam-unauthorized-access-route.test.ts) (audit/report export denial, cross-scope submit, payroll/auditor mutation denial). |

| Persona | Data scope mode | Capabilities (preset) |
| --- | --- | --- |
| Employee | `self` when `scopedEmployeeId` set | Read/write own leave, attendance, corrections; read balances, leave types, reports |
| Manager | `team` when `teamEmployeeIds` set | Team read/approve; attendance corrections; reports read/export — no HR config write |
| HR | `company` via write or config caps | Full LAM capability set |
| Payroll | `company` via `payrollReferencesRead` / reports | Payroll references read, reports read/export — no mutation write |
| Auditor | `company` via read/audit caps | Read-only across leave, attendance, corrections, audit, reports |

| Integration behaviour | Evidence |
| --- | --- |
| Scope precedence | `scopedEmployeeId` and `teamEmployeeIds` resolve before broad `canWrite` / export capabilities so employee/manager headers cannot be overridden by report export rights. Manager read queries fail closed without `teamEmployeeIds` when only manager-facing capabilities are granted ([`resolveLamReadDataScope`](./src/shared/data-scope.ts)). |
| Read query filtering | Employee-scoped queries in leave applications, attendance records, balances, corrections, exceptions, documents, attendance summary, payroll references. |
| Mutation scope checks | [`requireLamEmployeeMutationScope`](./src/shared/data-scope.ts) on submit leave, upsert attendance, corrections, documents, decisions, lifecycle, and scoped exports. |
| Context schema | `scopedEmployeeId`, `teamEmployeeIds` on [`lamReadContextSchema`](./src/schema.ts) / [`lamWriteContextSchema`](./src/schema.ts). |
| API headers | `x-lam-scoped-employee-id`, `x-lam-team-employee-ids` in [`apps/api/app/api/hr/leave/_lib/context.ts`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) and [`apps/api/app/api/hr/attendance/_lib/context.ts`](../../../../../apps/api/app/api/hr/attendance/_lib/context.ts). |
| Tenant permissions | `member` role granted employee self-service LAM caps; `manager` role narrowed (no leave type/entitlement/balance write, no attendance write, no payroll references read). |
| Dependencies | Seq 0 capability registry + all prior read/write slices. |
| Tests | [`test/leave-attendance-management-permission-enforcement.test.ts`](./test/leave-attendance-management-permission-enforcement.test.ts), [`apps/api/test/hr-lam-employee-self-service-route.test.ts`](../../../../../apps/api/test/hr-lam-employee-self-service-route.test.ts), [`apps/api/test/hr-lam-manager-team-scope-route.test.ts`](../../../../../apps/api/test/hr-lam-manager-team-scope-route.test.ts), [`apps/api/test/hr-lam-unauthorized-access-route.test.ts`](../../../../../apps/api/test/hr-lam-unauthorized-access-route.test.ts). |

| Seq 18 review (2026-06-10) | Result |
| --- | --- |
| Manager `auditRead` scope widening | Removed `hr.lam.audit.read` from catalog `manager` role to align with persona preset and prevent company-wide scope fallback. |
| Query filter consistency | Attendance summary and payroll reference list queries normalized to [`filterByEmployeeDataScope`](./src/shared/data-scope.ts). |
| Mutation scope fail-closed | [`resolveLamDataScope`](./src/shared/data-scope.ts) denies manager/operator capabilities without team ids or elevation (parity with read scope); auditor persona resolves to `denied` for mutation scope while retaining company read via [`resolveLamReadDataScope`](./src/shared/data-scope.ts). |
| Granular HR config write separation | Managers cannot mutate leave types, entitlements, blackout/carry-forward rules, approval routes, or company attendance settings via generic `canWrite`; approve/reject/amend require [`requireStrictLamApprovalAccess`](./src/execution.ts). |
| Test integrity | Permission tests assert `denied` scope, cross-employee read denial, distinct employee contexts, persona mutation denial, and sensitive read gate isolation. HTTP boundary in [`apps/api/test/hr-lam-unauthorized-access-route.test.ts`](../../../../../apps/api/test/hr-lam-unauthorized-access-route.test.ts). |
| Deferred (Slice 13) | API approval context auto-grants (`createLamApprovalContext`, `createLamCorrectionApprovalContext`) remain orchestration concerns. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Green — 306 pass, 6 skipped (DB integration when Postgres unavailable) |
| `pnpm --filter api typecheck` | Green (2026-06-10) |
| `pnpm --filter api test` | Green — 114 pass |
| `pnpm --filter api typecheck` | Green (2026-06-10) |

---

## Slice 17 — Payroll Reference Export Integration (HRM-LAM-026)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-026** | System shall expose approved leave, unpaid leave, absence, lateness, and attendance deduction references to Payroll Processing. | [`listPayrollReferences`](./src/projector/payroll-references.ts), [`listLamPayrollReferencesRecords`](./src/queries/payroll-references.query.ts), [`exportLamPayrollReferences`](./src/actions/payroll-references.action.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-020 | Approved attendance and leave outcomes are available for payroll processing. | All five deduction categories in [`test/leave-attendance-management-payroll-integration.test.ts`](./test/leave-attendance-management-payroll-integration.test.ts); HTTP boundary in [`apps/api/test/hr-lam-payroll-references-route.test.ts`](../../../../../apps/api/test/hr-lam-payroll-references-route.test.ts) (approved leave, attendance categories, mixed export, fail-closed list). |
| AC-017 | Unpaid leave is exposed to Payroll Processing for deduction reference. | Retained via `unpaid_leave` category in [`unpaid-leave-payroll-references.ts`](./src/projector/unpaid-leave-payroll-references.ts); HTTP boundary tests in [`apps/api/test/hr-lam-payroll-references-route.test.ts`](../../../../../apps/api/test/hr-lam-payroll-references-route.test.ts). |

| Deduction categories | Source | Projector |
| --- | --- | --- |
| `approved_leave` | Approved leave applications (paid or unpaid) | [`projectApprovedLeavePayrollReference`](./src/projector/unpaid-leave-payroll-references.ts) |
| `unpaid_leave` | Approved unpaid leave applications | [`projectUnpaidLeavePayrollReference`](./src/projector/unpaid-leave-payroll-references.ts) |
| `absence` | Attendance records with `status === absent` | [`projectAttendancePayrollReference`](./src/projector/attendance-payroll-references.ts) |
| `lateness` | Attendance records with `status === late` | [`projectAttendancePayrollReference`](./src/projector/attendance-payroll-references.ts) |
| `attendance_deduction` | `early_out`, `half_day`, `missing_punch` records | [`mapAttendanceStatusToDeductionCategory`](./src/projector/attendance-payroll-references.ts) |

| Integration behaviour | Evidence |
| --- | --- |
| Unified list/export | [`listPayrollReferences`](./src/projector/payroll-references.ts) aggregates category projectors; query accepts `deductionCategory` filter (`all` or specific). |
| Export batch | [`lamPayrollReferenceExportBatchSchema`](./src/schema.ts) tracks `deductionCategories[]`, `leaveApplicationIds[]`, `attendanceRecordIds[]`. |
| Export deduplication | [`resolveExportedPayrollReferenceIds`](./src/projector/unpaid-leave-payroll-references.ts) reads prior `payrollReferenceExported` audit metadata for leave and attendance ids. |
| Export input | `deductionCategories[]` on [`exportLamPayrollReferencesInputSchema`](./src/contracts/command.contract.ts); defaults to all integration categories when omitted. |
| Permission gate | Unchanged — [`canReadLamPayrollReferences`](./src/policy.ts) + [`requireLamPayrollReferencesExportAccess`](./src/execution.ts) enforce `hr.lam.payroll-references.read`. |
| API | Existing routes extended: `GET /api/hr/leave/payroll-references?deductionCategory=`, `POST /api/hr/leave/payroll-references/export` with `deductionCategories[]`. |
| Dependencies | Seq 15 unpaid leave payroll references + Seq 16 attendance summary period overlap patterns + Seq 11 attendance records + Seq 10 approved leave. |
| Tests | [`test/leave-attendance-management-payroll-integration.test.ts`](./test/leave-attendance-management-payroll-integration.test.ts), [`test/leave-attendance-management-unpaid-leave-payroll.test.ts`](./test/leave-attendance-management-unpaid-leave-payroll.test.ts), [`apps/api/test/hr-lam-payroll-references-route.test.ts`](../../../../../apps/api/test/hr-lam-payroll-references-route.test.ts). |

| Seq 17 review (2026-06-10) | Result |
| --- | --- |
| Export ID deduplication | [`collectPayrollReferenceExportIds`](./src/projector/payroll-references.ts) dedupes leave + attendance ids via `Set`; removed stale `referenceIds` fallback in export resolution. |
| Batch schema normalization | Removed legacy singular `deductionCategory` from export batch; `deductionCategories[]` only. |
| API 404 message | Payroll reference detail route returns `"Payroll reference not found"`. |
| Category test coverage | Payroll integration tests assert `half_day` and `missing_punch` under `attendance_deduction`. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Green — 162 pass, 2 skipped (DB integration when Postgres unavailable) |
| `pnpm --filter @repo/database typecheck` | Green (2026-06-10) |
| `pnpm --filter api typecheck` | Green (2026-06-10) |

---

## Slice 16 — Attendance Summary (HRM-LAM-025)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-025** | System shall summarize attendance by employee, department, manager, legal entity, work location, and period. | [`projectAttendanceSummary`](./src/projector/attendance-summary.ts), [`listLamAttendanceSummaryRecords`](./src/queries/attendance-summary.query.ts), [`exportLamAttendanceSummary`](./src/actions/attendance-summary.action.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-021 | Employees can view their own leave balance, leave history, and attendance summary. | Summary query supports `employeeId` + period filters; domain tests in [`test/leave-attendance-management-permission-enforcement.test.ts`](./test/leave-attendance-management-permission-enforcement.test.ts); HTTP boundary in [`apps/api/test/hr-lam-employee-self-service-route.test.ts`](../../../../../apps/api/test/hr-lam-employee-self-service-route.test.ts). |
| AC-024 | Leave and attendance reports can be generated by employee, department, leave type, attendance status, manager, location, legal entity, and period. | Export action emits `reportExported` audit; list/export accept `employeeIds[]` for orchestration-resolved org scope. |

| Summary behaviour | Evidence |
| --- | --- |
| Attendance counts | `daysWorked`, `absentDays`, `lateDays`, `earlyOutDays`, `halfDays`, `missingPunchDays`, `restDays`, `offDays`, `publicHolidayDays` from [`lamAttendanceSummarySchema`](./src/schema.ts). |
| Leave taken | Approved leave applications overlapping the period contribute `leaveTakenDays` and `leaveTakenByType` via calendar-day intersection. |
| Period filter | Records outside `periodStart`–`periodEnd` excluded; corrected attendance statuses from Seq 13 are read from final record state. |
| Permission gate | [`canReadLamReports`](./src/policy.ts) + [`readReportsContext`](./src/queries/shared.ts) enforce `hr.lam.reports.read`; export uses strict [`requireLamReportsExportAccess`](./src/execution.ts) for `hr.lam.reports.export`. |
| Export audit | [`exportLamAttendanceSummary`](./src/actions/attendance-summary.action.ts) emits high-risk [`reportExported`](./src/contracts/audit.contract.ts) with `entityType: report_export`. |
| API | `GET /api/hr/attendance/attendance-summary`, `POST /api/hr/attendance/attendance-summary/export`. |
| Dependencies | Seq 11 attendance records (HRM-LAM-001/002) + Seq 10 approved leave applications (HRM-LAM-016). |
| Tests | [`test/leave-attendance-management-attendance-summary.test.ts`](./test/leave-attendance-management-attendance-summary.test.ts). |

| Seq 16 review (2026-06-10) | Result |
| --- | --- |
| Architecture vs code audit | No material gaps — schema, projector, query, action, contracts, policy, execution, API routes, barrels, requirement registry, and tests all aligned. |
| Advisory note | Org-dimension filters (department, manager, legal entity, work location) deferred to orchestration via `employeeId` / `employeeIds[]` — by design. |

| Seq 15 review repair (applied in Slice 16) | Evidence |
| --- | --- |
| Payroll export redundant pending filter removed | [`exportLamPayrollReferences`](./src/actions/payroll-references.action.ts) relies on projector `exportStatus` only. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Green (2026-06-10) |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Green — 151 pass, 2 skipped (DB integration when Postgres unavailable) |
| `pnpm --filter @repo/database typecheck` | Green (2026-06-10) |
| `pnpm --filter api typecheck` | Green (2026-06-10) |

---

## Slice 15 — Unpaid Leave Tracking + Payroll Deduction Reference Export (HRM-LAM-020)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-020** | System shall track unpaid leave and expose payroll deduction reference to Payroll Processing. | [`isUnpaidLeaveType`](./src/projector/unpaid-leave-payroll-references.ts), [`listLamPayrollReferencesRecords`](./src/queries/payroll-references.query.ts), [`exportLamPayrollReferences`](./src/actions/payroll-references.action.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-017 | Unpaid leave is exposed to Payroll Processing for deduction reference. | [`projectUnpaidLeavePayrollReference`](./src/projector/unpaid-leave-payroll-references.ts) with `deductionCategory: unpaid_leave` and stable `sourceReference`; balance bypass via [`shouldReserveLeaveBalance`](./src/projector/unpaid-leave-payroll-references.ts); [`exportLamPayrollReferences`](./src/actions/payroll-references.action.ts) + [`requireLamPayrollReferencesExportAccess`](./src/execution.ts); API routes use [`createLamPayrollReadContext`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) / [`createLamPayrollExportContext`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) with JSON guard on export; tests in [`test/leave-attendance-management-unpaid-leave-payroll.test.ts`](./test/leave-attendance-management-unpaid-leave-payroll.test.ts) and [`apps/api/test/hr-lam-payroll-references-route.test.ts`](../../../../../apps/api/test/hr-lam-payroll-references-route.test.ts). |

| Unpaid leave behaviour | Evidence |
| --- | --- |
| Balance bypass | [`shouldReserveLeaveBalance`](./src/projector/unpaid-leave-payroll-references.ts) skips balance validation/reservation on submit and balance finalize/release on approve/reject/cancel/amend for unpaid leave types. |
| Payroll reference projection | [`lamUnpaidLeavePayrollReferenceSchema`](./src/schema.ts) with `deductionCategory: unpaid_leave` and stable `sourceReference`. |
| List query | [`listLamPayrollReferencesRecords`](./src/queries/payroll-references.query.ts) filters by employee, pay period, and export status (`pending` / `exported` / `all`). |
| Export action | [`exportLamPayrollReferences`](./src/actions/payroll-references.action.ts) emits high-risk [`payrollReferenceExported`](./src/contracts/audit.contract.ts) with `entityType: report_export`. |
| Permission gate | [`canReadLamPayrollReferences`](./src/policy.ts) + [`requireLamPayrollReferencesExportAccess`](./src/execution.ts) enforce `hr.lam.payroll-references.read`. |
| API | `GET /api/hr/leave/payroll-references`, `GET /api/hr/leave/payroll-references/:applicationId`, `POST /api/hr/leave/payroll-references/export`. |
| Dependency | Builds on Seq 10 leave balance lifecycle (HRM-LAM-016) with explicit unpaid bypass. |
| Tests | [`test/leave-attendance-management-unpaid-leave-payroll.test.ts`](./test/leave-attendance-management-unpaid-leave-payroll.test.ts), [`test/leave-attendance-management-database-integration.test.ts`](./test/leave-attendance-management-database-integration.test.ts). |

| Seq 14 review repair (applied in Slice 15) | Evidence |
| --- | --- |
| Drizzle journal registration for migrations 0011–0018 | [`packages/database/drizzle/meta/_journal.json`](../../../../../packages/database/drizzle/meta/_journal.json). |
| Medical references HTTP route | `GET /api/hr/leave/leave-applications/:applicationId/medical-references`. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Required green |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Required green |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Required green |
| `pnpm --filter @repo/database typecheck` | Required green |
| `pnpm --filter api typecheck` | Required green |

---

## Slice 14 — Medical Leave Certificate / Clinic / Hospitalization References (HRM-LAM-021)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-021** | System shall track medical leave with medical certificate reference where required. | [`assertLeaveDocumentSatisfiesMedicalLeavePolicy`](./src/projector/medical-leave-references.ts), extended [`lamLeaveDocumentSchema`](./src/schema.ts), [`submitLamLeaveApplication`](./src/actions/leave-applications.action.ts) linkage + audit. |

| Acceptance Criteria | Evidence |
| --- | --- |
| HRM-LAM-021 (medical references) | Medical leave tracks certificate, panel clinic, and hospitalization references when required. | Medical leave tests cover kind enforcement, clinic reference, hospitalization document, linked query, and `leaveMedicalCertificateLinked` audit. |

| Reference behaviour | Evidence |
| --- | --- |
| Document kinds | `supporting_document`, `medical_certificate`, `panel_clinic_referral`, `hospitalization_document` on [`lamLeaveDocumentKindSchema`](./src/schema.ts). |
| Medical leave policy | `medical` + `requiresDocument` → `medical_certificate` or `panel_clinic_referral` with reference + panel clinic; optional `sourceDocumentId` linkage validated on confirm/submit. |
| Hospitalization policy | `hospitalization` + `requiresDocument` → `hospitalization_document` with reference number or admission date. |
| Source document validation | [`assertLeaveDocumentSourceReference`](./src/projector/medical-leave-references.ts) enforces company/employee scope, availability, and `medical_certificate` source for referrals/hospitalization links. |
| Upload session | [`createLamLeaveDocumentUploadSession`](./src/actions/leave-documents.action.ts) persists reference metadata at session creation. |
| Submit linkage | [`resolveSupportingDocument`](./src/actions/leave-applications.action.ts) validates policy before link; emits high-risk [`leaveMedicalCertificateLinked`](./src/contracts/audit.contract.ts). |
| Query | [`getLamMedicalLeaveReferencesForApplication`](./src/queries/leave-documents.query.ts), list filter by `documentKind`. |
| API | `GET /api/hr/leave/leave-applications/:applicationId/medical-references`. |
| Persistence | DB columns on `lam_leave_documents` in [`0017_lam_medical_leave_references.sql`](../../../../../packages/database/drizzle/0017_lam_medical_leave_references.sql). |
| Dependency | Builds on Seq 5 submit (`HRM-LAM-007`) + Seq 6 document upload (`HRM-LAM-008`). |
| Tests | [`test/leave-attendance-management-medical-leave.test.ts`](./test/leave-attendance-management-medical-leave.test.ts), [`test/leave-attendance-management-database-integration.test.ts`](./test/leave-attendance-management-database-integration.test.ts). |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Required green |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Required green |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Required green |
| `pnpm --filter @repo/database typecheck` | Required green |
| `pnpm --filter api typecheck` | Required green |

---

## Slice 13 — Attendance Correction Request + Approval (HRM-LAM-023 + HRM-LAM-024)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-023** | System shall allow attendance exception correction requests where enabled. | [`submitLamAttendanceCorrection`](./src/actions/attendance-corrections.action.ts), [`submitLamAttendanceCorrectionInputSchema`](./src/contracts/command.contract.ts), [`requireLamAttendanceCorrectionsWriteAccess`](./src/execution.ts). |
| **HRM-LAM-024** | System shall route attendance correction requests through approval workflow. | Reuses [`selectLeaveApprovalRoute`](./src/projector/approval-routing.ts) + [`resolveCurrentApprovalStep`](./src/projector/approval-routing.ts) for generic routes (no `leaveTypeId`); [`approveLamAttendanceCorrection`](./src/actions/attendance-corrections.action.ts), [`rejectLamAttendanceCorrection`](./src/actions/attendance-corrections.action.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-019 | Attendance correction request can be submitted and approved where enabled. | [`submitLamAttendanceCorrection`](./src/actions/attendance-corrections.action.ts) + [`approveLamAttendanceCorrection`](./src/actions/attendance-corrections.action.ts) with [`requireLamAttendanceCorrectionsWriteAccess`](./src/execution.ts) / [`requireStrictLamCorrectionApprovalAccess`](./src/execution.ts); API routes use [`createLamCorrectionWriteContext`](../../../../../apps/api/app/api/hr/attendance/_lib/context.ts) / [`createLamCorrectionApprovalContext`](../../../../../apps/api/app/api/hr/attendance/_lib/context.ts) with JSON guards; tests in [`test/leave-attendance-management-attendance-corrections.test.ts`](./test/leave-attendance-management-attendance-corrections.test.ts) and [`apps/api/test/hr-lam-attendance-corrections-route.test.ts`](../../../../../apps/api/test/hr-lam-attendance-corrections-route.test.ts). |

| Correction behaviour | Evidence |
| --- | --- |
| Exception validation | Submit requires detectable exception on linked record via [`detectAttendanceExceptionsFromRecord`](./src/projector/attendance-exceptions.ts). |
| Duplicate guard | One pending correction per `attendanceRecordId` + `exceptionType`. |
| Approval routing | Generic leave approval routes (no `leaveTypeId`) match attendance corrections with `totalDays: 1`. |
| Final approval | Applies `requestedStatus`, `requestedClockInAt`, `requestedClockOutAt` to attendance record; emits `attendanceRecordUpserted` + high-risk `attendanceCorrectionApproved`. |
| Rejection | Sets `rejected` + `rejectionReason`; does not mutate attendance record. |
| Persistence | [`lamAttendanceCorrectionSchema`](./src/schema.ts), repository `attendanceCorrections` collection, DB table `lam_attendance_corrections` in [`0016_lam_attendance_corrections.sql`](../../../../../packages/database/drizzle/0016_lam_attendance_corrections.sql). |
| Capability gates | Read: `hr.lam.attendance-corrections.read` via [`canReadLamAttendanceCorrections`](./src/policy.ts). Write/approve: `hr.lam.attendance-corrections.write` via execution gates. |
| Where enabled | Persisted per-company [`lamCompanyAttendanceSettingsSchema`](./src/schema.ts) (`attendanceCorrectionsEnabled`, default `true`) enforced by [`requireLamAttendanceCorrectionsEnabledForCompany`](./src/execution.ts); orchestration may also disable via `x-lam-attendance-corrections-enabled: false`. Configure via [`upsertLamCompanyAttendanceSettings`](./src/actions/company-attendance-settings.action.ts) and `GET/POST /api/hr/attendance/attendance-settings`. |
| Audit | `attendanceExceptionDetected` emitted on submit linkage; `attendanceCorrectionSubmitted`, `attendanceCorrectionApproved` (high-risk), `attendanceCorrectionRejected`. |
| HTTP API | [`GET/POST /api/hr/attendance/attendance-corrections`](../../../../../apps/api/app/api/hr/attendance/attendance-corrections/route.ts), [`GET .../:correctionId`](../../../../../apps/api/app/api/hr/attendance/attendance-corrections/[correctionId]/route.ts), [`POST .../approve`](../../../../../apps/api/app/api/hr/attendance/attendance-corrections/[correctionId]/approve/route.ts), [`POST .../reject`](../../../../../apps/api/app/api/hr/attendance/attendance-corrections/[correctionId]/reject/route.ts) via `createLamCorrectionsReadContext` / `createLamCorrectionWriteContext` / `createLamCorrectionApprovalContext`. |
| Tests | [`test/leave-attendance-management-attendance-corrections.test.ts`](./test/leave-attendance-management-attendance-corrections.test.ts), [`test/leave-attendance-management-company-attendance-settings.test.ts`](./test/leave-attendance-management-company-attendance-settings.test.ts), [`apps/api/test/hr-lam-attendance-corrections-route.test.ts`](../../../../../apps/api/test/hr-lam-attendance-corrections-route.test.ts) (multi-step routed approve, disabled-company submit, orchestration header disable), [`apps/api/test/hr-lam-attendance-settings-route.test.ts`](../../../../../apps/api/test/hr-lam-attendance-settings-route.test.ts). |
| Route contracts | [`lamAttendanceSettingsRouteContracts`](./src/contracts/query.contract.ts) in [`lamRouteContracts`](./src/contracts/query.contract.ts) manifest surface. |
| Orchestration contract | **Admin disable:** `POST /api/hr/attendance/attendance-settings` `{ attendanceCorrectionsEnabled: false }`. **Runtime gate:** omit `hr.lam.attendance-corrections.write` from `x-lam-capabilities` and/or set `x-lam-attendance-corrections-enabled: false`. **Multi-step approve:** per-step `x-lam-actor-employee-id` + `x-lam-resolved-step-approver-employee-ids` on each `POST .../approve`. **DB mode:** apply [`0021_lam_company_attendance_settings.sql`](../../../../../packages/database/drizzle/0021_lam_company_attendance_settings.sql) before `DATABASE_URL` repository mode. |
| API fail-closed | Approve/reject require explicit `hr.lam.attendance-corrections.write` (no auto-grant on approval context); submit binds scoped employee via `bindLamEmployeeSubmitBody`. |

| Seq 12 review repair (applied in Slice 13) | Evidence |
| --- | --- |
| Stable exception id | [`buildAttendanceExceptionId`](./src/projector/attendance-exceptions.ts) + `id` on [`lamAttendanceExceptionSchema`](./src/schema.ts). |
| Query coercion | `gracePeriodMinutes` uses `z.coerce.number()` in list query schema. |
| Corrections read gate | Exception/correction queries use [`canReadLamAttendanceCorrections`](./src/policy.ts) via `readAttendanceCorrectionsContext`. |
| Exception detected audit | Emitted on correction submit when exception is linked. |
| Per-record exception API | [`GET /api/hr/attendance/attendance-exceptions/:recordId`](../../../../../apps/api/app/api/hr/attendance/attendance-exceptions/[recordId]/route.ts). |

| Seq 13 review hardening (applied) | Evidence |
| --- | --- |
| Reject audit assertion | Corrections test asserts `attendanceCorrectionRejected` audit on reject. |
| Intermediate approval audit | Multi-step test asserts `isFinalApproval: false` on first approve audit. |
| DB pending duplicate guard | Partial unique index in [`0018_lam_attendance_correction_pending_unique.sql`](../../../../../packages/database/drizzle/0018_lam_attendance_correction_pending_unique.sql). |
| Per-step approver identity | [`assertActorAuthorizedForApprovalStep`](./src/shared/leave-approval-step-enforcement.ts) enforced on correction approve/reject when `pending_approval` + route; orchestration supplies `actorEmployeeId` + `resolvedStepApproverEmployeeIds` (API headers `x-lam-actor-employee-id`, `x-lam-resolved-step-approver-employee-ids` in [`apps/api/.../attendance/_lib/context.ts`](../../../../../apps/api/app/api/hr/attendance/_lib/context.ts)). |
| HTTP status parity | Attendance correction/record/summary export routes use [`mapLamMutationHttpStatus`](../../../../../apps/api/app/api/hr/leave/_lib/mutation-response.ts) for 403/422/400 mapping. |

| Verification commands | Result |
| --- | --- |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck` | Required green |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint` | Required green |
| `pnpm --filter @repo/features-time-attendance-leave-attendance-management test` | Required green |
| `pnpm --filter @repo/database typecheck` | Required green |
| `pnpm --filter api typecheck` | Required green |

---

## Slice 12 — Attendance Exception Detection (HRM-LAM-022)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-022** | System shall detect attendance exceptions such as late arrival, early departure, absence, and missing punch. | [`detectAttendanceExceptionsFromRecord`](./src/projector/attendance-exceptions.ts), [`listLamAttendanceExceptionsRecords`](./src/queries/attendance-exceptions.query.ts), [`getLamAttendanceExceptionsForRecord`](./src/queries/attendance-exceptions.query.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-018 | Attendance exceptions such as late, early out, absent, and missing punch are flagged. | [`detectAttendanceExceptionsFromRecord`](./src/projector/attendance-exceptions.ts) flags all four types via status mapping, missing-clock rules, and optional clock policy; [`listLamAttendanceExceptionsRecords`](./src/queries/attendance-exceptions.query.ts) / [`getLamAttendanceExceptionsForRecord`](./src/queries/attendance-exceptions.query.ts) with employee scope; correction submit accepts matching detection policy; API routes use [`createLamAttendanceExceptionsReadContext`](../../../../../apps/api/app/api/hr/attendance/_lib/context.ts); tests in [`test/leave-attendance-management-attendance-exceptions.test.ts`](./test/leave-attendance-management-attendance-exceptions.test.ts) and [`apps/api/test/hr-lam-attendance-exceptions-route.test.ts`](../../../../../apps/api/test/hr-lam-attendance-exceptions-route.test.ts). |

| Detection behaviour | Evidence |
| --- | --- |
| Status-based detection | `late` → `late_arrival`, `early_out` → `early_departure`, `absent` → `absence`, `missing_punch` → `missing_punch`. |
| Missing clock detection | `present` / `half_day` without both clock times → `missing_punch` (`clock_missing` source). |
| Scheduled clock policy | Optional `scheduledClockInAt`, `scheduledClockOutAt`, `gracePeriodMinutes` detect late/early from actual clock times (`clock_policy` source). |
| Non-exception statuses | `present` (with clocks), `rest_day`, `off_day`, `public_holiday` produce no exceptions. |
| Exception projection schema | [`lamAttendanceExceptionSchema`](./src/schema.ts) with stable `id`, `exceptionType`, `source`, record linkage, and clock metadata. |
| Audit event catalog | `attendanceExceptionDetected` in audit catalog; emitted when correction links to detected exception (Seq 13). |
| HTTP API | [`GET /api/hr/attendance/attendance-exceptions`](../../../../../apps/api/app/api/hr/attendance/attendance-exceptions/route.ts), [`GET .../:recordId`](../../../../../apps/api/app/api/hr/attendance/attendance-exceptions/[recordId]/route.ts) via `createLamAttendanceExceptionsReadContext`. |
| Tests | [`test/leave-attendance-management-attendance-exceptions.test.ts`](./test/leave-attendance-management-attendance-exceptions.test.ts), [`apps/api/test/hr-lam-attendance-exceptions-route.test.ts`](../../../../../apps/api/test/hr-lam-attendance-exceptions-route.test.ts). |
| Correction policy alignment | [`submitLamAttendanceCorrectionInputSchema`](./src/contracts/command.contract.ts) optional schedule/grace fields align correction validation with list/get clock policy detection. |

| Seq 11 review repair | Evidence |
| --- | --- |
| DB date uniqueness clarified | App normalizes `attendanceDate` to UTC midnight before write; DB unique index on timestamp relies on app normalization (documented — no out-of-band writers). |
| Exception read route capability | Route contract uses `hr.lam.attendance-corrections.read` for manager exception views (AC-022 alignment); manager reads require `x-lam-team-employee-ids` unless company read elevation is present. |

---

## Slice 11 — Daily Attendance Records (HRM-LAM-001 + HRM-LAM-002)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-001** | System shall maintain employee attendance records by employee, date, work calendar, and attendance status. | [`upsertLamAttendanceRecord`](./src/actions/attendance-records.action.ts), [`listLamAttendanceRecordsRecords`](./src/queries/attendance-records.query.ts), [`getLamAttendanceRecordById`](./src/queries/attendance-records.query.ts), [`lamAttendanceRecordSchema`](./src/schema.ts). |
| **HRM-LAM-002** | System shall support attendance statuses including present, absent, late, early out, half-day, rest day, off day, public holiday, and missing punch. | [`lamAttendanceStatusValues`](./src/schema.ts) (9 statuses), validated via [`lamAttendanceStatusSchema`](./src/schema.ts) on upsert input. |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-001 | Employee attendance record can be maintained by employee and date. | Upsert creates/updates record; unique employee+date enforced at app and DB layer. |
| AC-002 | Attendance status can show present, absent, late, early out, half-day, rest day, off day, holiday, or missing punch. | [`lamAttendanceStatusValues`](./src/schema.ts) (9 statuses); [`normalizeAttendanceStatusInput`](./src/shared/attendance-status.ts) maps AC alias `holiday` → `public_holiday` and hyphen forms; [`lamAttendanceStatusLabels`](./src/shared/attendance-status.ts) on metadata/manifest for UI display. |

| AC-002 review (2026-06-10) | Result |
| --- | --- |
| Enum completeness | All 9 canonical statuses validated on upsert, list filter, and summary projector counts. |
| AC alias normalization | `holiday` and `public-holiday` accepted at schema boundary; canonical storage `public_holiday`. |
| Summary coverage | Attendance summary test asserts `restDays`, `offDays`, `publicHolidayDays` alongside operational statuses. |
| Client metadata surface | `lamAttendanceStatusLabels` exported via `/metadata`, `/manifest`, and `/contract` for governed UI labels. |
| Tests | Enum + alias normalization in [`test/leave-attendance-management-attendance-records.test.ts`](./test/leave-attendance-management-attendance-records.test.ts); full status rollup in [`test/leave-attendance-management-attendance-summary.test.ts`](./test/leave-attendance-management-attendance-summary.test.ts). |

| Record behaviour | Evidence |
| --- | --- |
| One record per employee per day | App-layer duplicate check via [`normalizeAttendanceDate`](./src/shared/attendance-date.ts); DB unique index on `(tenant_id, company_id, employee_id, attendance_date)` as PostgreSQL `date` in [`0019_lam_attendance_date_calendar_day.sql`](../../../../../packages/database/drizzle/0019_lam_attendance_date_calendar_day.sql). |
| Work calendar reference | `workCalendarId` on schema; filterable in list query. |
| Clock times | Optional `clockInAt` / `clockOutAt`; validated clock-out ≥ clock-in. |
| Capability gate | [`requireLamAttendanceWriteAccess`](./src/execution.ts) for writes (`hr.lam.attendance.write` or write access). |
| Audit | `attendanceRecordUpserted` emitted on every upsert; added to high-risk audit events. |
| HTTP API | [`GET/POST /api/hr/attendance/attendance-records`](../../../../../apps/api/app/api/hr/attendance/attendance-records/route.ts), [`GET /api/hr/attendance/attendance-records/:recordId`](../../../../../apps/api/app/api/hr/attendance/attendance-records/[recordId]/route.ts). |
| Tests | [`test/leave-attendance-management-attendance-records.test.ts`](./test/leave-attendance-management-attendance-records.test.ts), DB path in [`test/leave-attendance-management-database-integration.test.ts`](./test/leave-attendance-management-database-integration.test.ts). |

| AC-001 review (2026-06-10) | Result |
| --- | --- |
| End-to-end stack | Schema, action, query, contracts, policy, audit, API routes, file + database persistence verified. |
| Calendar-day integrity | Shared [`normalizeAttendanceDate`](./src/shared/attendance-date.ts); migration `0019` changes `attendance_date` to PostgreSQL `date` for DB-enforced uniqueness. |
| Company isolation | List query filters by company; cross-company test added. |
| Permission gates | Write requires `hr.lam.attendance.write` or admin `canWrite`; read fail-closed without capabilities. |

| Seq 10 review repair | Evidence |
| --- | --- |
| Strict approval for cancel approved | [`requireStrictLamApprovalAccess`](./src/execution.ts) — generic `canWrite` no longer bypasses approve capability for approved cancellations. |
| Cancelled-by audit metadata | `cancelledBy` captured in cancel audit metadata (input override or actor). |
| Cancel returned documented | Returned cancel performs no balance change (pending already released on return). |
| Amend policy scope documented | Amend re-validates dates, max days, overlap, and optional blackout — not notice/eligibility (checked at submit). |
| Extended lifecycle tests | Cancel submitted/returned, strict approval gate, amend permission gate. |

---

## Slice 10 — Leave Balance Lifecycle + Manual Adjustment (HRM-LAM-016 + HRM-LAM-017 + HRM-LAM-018)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-016** | System shall update leave balance after leave approval, cancellation, adjustment, or reversal. | Shared helpers in [`src/shared/leave-application-balance.ts`](./src/shared/leave-application-balance.ts): `finalizeLeaveApplicationApprovedBalance` (Seq 9 approve), `releaseLeaveApplicationPendingBalance` (reject/return/cancel pending), `reverseLeaveApplicationApprovedBalance` (cancel approved), `adjustLeaveApplicationUsedBalance` (amend). |
| **HRM-LAM-017** | System shall support leave cancellation and amendment based on policy. | [`cancelLamLeaveApplication`](./src/actions/leave-application-lifecycle.action.ts) from `submitted`, `pending_approval`, `approved`, `returned`; [`amendLamLeaveApplication`](./src/actions/leave-application-lifecycle.action.ts) for `approved` only with date/overlap/blackout re-validation. |
| **HRM-LAM-018** | System shall support manual leave balance adjustment with reason and authorization. | [`adjustLamLeaveBalance`](./src/actions/leave-balance-adjustment.action.ts) gated by [`requireLamBalanceWriteAccess`](./src/execution.ts) (`leaveBalancesWrite` capability or write access). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-013 | Approved leave updates leave balance. | Final approve moves `pending` → `used` via [`finalizeLeaveApplicationApprovedBalance`](./src/shared/leave-application-balance.ts) and [`finalizeApprovedLeaveApplicationBalanceIfRequired`](./src/shared/leave-application-balance.ts) (fail-closed when leave type inactive but pending remains); multi-step defers until last step; [`test/leave-attendance-management-leave-application-decisions.test.ts`](./test/leave-attendance-management-leave-application-decisions.test.ts) AC-013 tests + balance audit; API [`POST .../approve`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/approve/route.ts) verified in [`apps/api/test/hr-lam-approve-route.test.ts`](../../../../../apps/api/test/hr-lam-approve-route.test.ts); intermediate-step approve skips premature approved notification. |
| AC-014 | Leave cancellation or amendment updates leave balance correctly. | Cancel pending/submitted releases `pending` via [`releaseLeaveApplicationPendingBalanceIfRequired`](./src/shared/leave-application-balance.ts); cancel approved reverses `used` via [`reverseLeaveApplicationApprovedBalanceIfRequired`](./src/shared/leave-application-balance.ts) (fail-closed when inactive type but reservation remains); cancel returned is no-op; amend adjusts `used` via [`adjustLeaveApplicationUsedBalance`](./src/shared/leave-application-balance.ts) with cross-period guard; balance audit on cancel/amend in [`test/leave-attendance-management-leave-application-lifecycle.test.ts`](./test/leave-attendance-management-leave-application-lifecycle.test.ts); API routes in [`apps/api/test/hr-lam-cancel-amend-route.test.ts`](../../../../../apps/api/test/hr-lam-cancel-amend-route.test.ts). |
| AC-015 | Manual leave balance adjustment requires authorization and reason. | [`adjustLamLeaveBalance`](./src/actions/leave-balance-adjustment.action.ts) requires non-empty `reason` + `authorizedBy` with explicit validation messages; gated by [`requireLamBalanceWriteAccess`](./src/execution.ts) and [`requireLamEmployeeMutationScope`](./src/execution.ts); `leaveBalanceUpdated` audit with `entityType: leave_adjustment` and authorization metadata; domain tests in [`test/leave-attendance-management-leave-balances.test.ts`](./test/leave-attendance-management-leave-balances.test.ts); API [`POST .../leave-balances/adjust`](../../../../../apps/api/app/api/hr/leave/leave-balances/adjust/route.ts) via [`createLamBalanceWriteContext`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) in [`apps/api/test/hr-lam-adjust-balance-route.test.ts`](../../../../../apps/api/test/hr-lam-adjust-balance-route.test.ts). |

| Lifecycle behaviour | Evidence |
| --- | --- |
| Cancel pending/submitted | Releases `pending` reservation via `releaseLeaveApplicationPendingBalance`. |
| Cancel returned | No balance change (pending already released on return). |
| Cancel approved | Requires strict approval capability via [`requireStrictLamApprovalAccess`](./src/execution.ts); reverses `used` via `reverseLeaveApplicationApprovedBalance`. |
| Amend approved | Re-validates date range, max consecutive days, overlap, and optional blackout when `hireDate` supplied; adjusts `used` when `totalDays` changes; audit `leaveApplicationAmended`. |
| Cancellation reason | [`cancellationReason`](./src/schema.ts) on application; required on cancel input; `cancelledBy` in audit metadata. |
| High-risk audit | `leaveApplicationCancelled`, `leaveApplicationAmended`, `leaveApplicationReturned` in high-risk list. |
| HTTP API | [`POST .../cancel`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/cancel/route.ts), [`POST .../amend`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/amend/route.ts). |
| Tests | [`test/leave-attendance-management-leave-application-lifecycle.test.ts`](./test/leave-attendance-management-leave-application-lifecycle.test.ts). |

| Seq 9 repair | Evidence |
| --- | --- |
| Balance helpers extracted | Decisions and lifecycle share [`src/shared/leave-application-balance.ts`](./src/shared/leave-application-balance.ts). |
| Cancel audit wired | `leaveApplicationCancelled` emitted from cancel action (was defined but unused). |
| High-risk audit gaps closed | `leaveApplicationReturned`, `leaveApplicationCancelled`, `leaveApplicationAmended` added to high-risk events. |

---

## Slice 9 — Approver Actions (HRM-LAM-014 + HRM-LAM-015)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-014** | System shall allow approvers to approve, reject, return, or request clarification for leave applications. | [`approveLamLeaveApplication`](./src/actions/leave-application-decisions.action.ts), [`rejectLamLeaveApplication`](./src/actions/leave-application-decisions.action.ts), [`returnLamLeaveApplication`](./src/actions/leave-application-decisions.action.ts), [`requestLamLeaveApplicationClarification`](./src/actions/leave-application-decisions.action.ts). |
| **HRM-LAM-015** | System shall require rejection reason for rejected leave applications. | [`rejectLamLeaveApplicationInputSchema`](./src/contracts/command.contract.ts) requires `rejectionReason`; reject action persists `rejectionReason` on application. |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-011 | Approver can approve, reject, return, or request clarification. | Decision tests cover all four actions with `hr.lam.leave-applications.approve` capability gate via [`requireLamApprovalAccess`](./src/execution.ts); step enforcement on all four via [`requireActorAuthorizedForApprovalStep`](./src/shared/leave-approval-step-enforcement.ts); authorization path audit metadata on approve/reject/return/clarify; clarification notifications use `requestType: "clarification"` distinct copy while sharing `lam.leave-application.returned` event. |
| AC-012 | Rejected leave application stores rejection reason. | Reject action writes `rejectionReason`; audit `leaveApplicationRejected` metadata includes reason; [`rejectLamLeaveApplicationInputSchema`](./src/contracts/command.contract.ts) requires non-empty reason with explicit validation message; entity schema rejects empty persisted values; [`redactLamLeaveApplicationSensitiveFields`](./src/shared/leave-application-sensitive-fields.ts) masks `rejectionReason` on list/get without `hr.lam.leave-applications.approve`; rejected notifications use persisted `application.rejectionReason` via [`buildLamLeaveApplicationNotificationIntent`](./src/projector/notifications.ts) and decision notification read context. |

| Workflow behaviour | Evidence |
| --- | --- |
| Multi-step approval | Approve advances `currentStepOrder` until final step; final approve sets `status: approved`, `approvedAt`, `approvedBy`. |
| Balance on final approve | Final approve moves `pending` → `used` via [`finalizeLeaveApplicationApprovedBalance`](./src/shared/leave-application-balance.ts). |
| Balance on reject/return/clarify | [`releaseLeaveApplicationPendingBalance`](./src/shared/leave-application-balance.ts) reverses submit reservation. |
| Resubmit after return | [`submitLamLeaveApplication`](./src/actions/leave-applications.action.ts) allows resubmit from `returned` status. |
| HTTP API | [`POST .../approve`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/approve/route.ts), [`POST .../reject`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/reject/route.ts), [`POST .../return`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/return/route.ts), [`POST .../clarify`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/clarify/route.ts). |
| Tests | [`test/leave-attendance-management-leave-application-decisions.test.ts`](./test/leave-attendance-management-leave-application-decisions.test.ts). |

| Seq 8 review | Evidence |
| --- | --- |
| Seq 8 complete | Routing projector, route CRUD, auto-route on submit, manual route, 7 routing tests — all verified green. |
| Approval capability gate | New `requireLamApprovalAccess` separates write vs approve permissions. |

---

## Slice 8 — Leave Approval Routing (HRM-LAM-012 + HRM-LAM-013)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-012** | System shall route leave applications through approval workflow. | [`submitLamLeaveApplication`](./src/actions/leave-applications.action.ts) auto-routes to `pending_approval` when a matching route exists; [`routeLamLeaveApplication`](./src/actions/leave-approval-routes.action.ts) for manual routing of `submitted` applications. |
| **HRM-LAM-013** | System shall support approval routing by manager, HR, department, leave type, duration, and employee grade. | [`selectLeaveApprovalRoute`](./src/projector/approval-routing.ts) matches `leaveTypeId`, `minDurationDays`/`maxDurationDays`, scope dimensions (`grade`, `departmentId`, etc.), and step kinds (`direct_manager`, `department_head`, `hr_officer`, `named_approver`). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-010 | Leave application follows configured approval workflow. | Submit transitions to `pending_approval` with `approvalRouteId` and `currentStepOrder`; audit `leaveApplicationRouted`. |

| AC-010 review (2026-06-10) | Result |
| --- | --- |
| Route selection | [`selectLeaveApprovalRoute`](./src/projector/approval-routing.ts) matches leave type, duration bounds, and scope dimensions; most-specific route wins. |
| Auto-route on submit | [`applyApprovalRouteToApplication`](./src/actions/leave-applications.action.ts) sets `pending_approval`, `approvalRouteId`, `currentStepOrder: 1`; emits `leaveApplicationRouted` audit. |
| Manual route | [`routeLamLeaveApplication`](./src/actions/leave-approval-routes.action.ts) for `submitted` applications when route configured later. |
| Multi-step approve | [`applyApproveDecision`](./src/actions/leave-application-decisions.action.ts) advances `currentStepOrder` until final step → `approved` + balance finalize. |
| Workflow progress | [`resolveLeaveApprovalProgress`](./src/shared/leave-approval-workflow.ts) exposes current/next step for clients; [`assertLeaveApplicationReadyForApprovalDecision`](./src/shared/leave-approval-workflow.ts) blocks inconsistent `submitted` + route state. |
| Step kinds (HRM-LAM-013) | `direct_manager`, `department_head`, `hr_officer`, `named_approver` on route steps; labels via [`lamLeaveApprovalStepKindLabels`](./src/shared/leave-approval-workflow.ts). |
| Client metadata | [`lamLeaveApprovalRouteFieldLabels`](./src/shared/leave-approval-workflow.ts), [`lamLeaveApplicationWorkflowFieldLabels`](./src/shared/leave-approval-workflow.ts) on `/metadata`, `/manifest`, `/contract`. |
| HTTP API | Approve/reject/return/clarify/route and approval-route upsert map failures to **403/422/400** via [`mapLamMutationHttpStatus`](../../../../../apps/api/app/api/hr/leave/_lib/mutation-response.ts). |
| Tests | [`test/leave-attendance-management-leave-approval-routing.test.ts`](./test/leave-attendance-management-leave-approval-routing.test.ts), [`test/leave-attendance-management-leave-application-decisions.test.ts`](./test/leave-attendance-management-leave-application-decisions.test.ts), [`test/leave-attendance-management-leave-approval-workflow.test.ts`](./test/leave-attendance-management-leave-approval-workflow.test.ts), [`test/leave-attendance-management-leave-approval-step-enforcement.test.ts`](./test/leave-attendance-management-leave-approval-step-enforcement.test.ts). |
| Per-step approver identity | Orchestration resolves current-step approver employee IDs from org hierarchy (outside LAM) and passes `actorEmployeeId` + `resolvedStepApproverEmployeeIds` on mutation context; [`assertActorAuthorizedForApprovalStep`](./src/shared/leave-approval-step-enforcement.ts) validates before approve/reject/return/clarify. API headers: `x-lam-actor-employee-id`, `x-lam-resolved-step-approver-employee-ids`. |
| Out of scope (documented) | Auto-escalation — overdue notifications (HRM-LAM-028) notify only. |
| fallbackToHr delegation | When step `fallbackToHr` is true on `direct_manager`, `department_head`, or `named_approver`, orchestration sets `hrFallbackDelegated: true` and supplies `resolvedHrFallbackApproverEmployeeIds`; [`evaluateApprovalStepAuthorization`](./src/shared/leave-approval-step-enforcement.ts) authorizes HR fallback only under those explicit rules. API headers: `x-lam-hr-fallback-delegated`, `x-lam-resolved-hr-fallback-approver-employee-ids`. |

| Route configuration | Evidence |
| --- | --- |
| Approval route schema | [`lamLeaveApprovalRouteSchema`](./src/schema.ts), [`lamLeaveApprovalRouteStepSchema`](./src/schema.ts) with step kinds and optional `approverRef`. |
| Route CRUD | [`upsertLamLeaveApprovalRoute`](./src/actions/leave-approval-routes.action.ts), [`listLamLeaveApprovalRoutesRecords`](./src/queries/leave-approval-routes.query.ts). |
| Application workflow fields | [`lamLeaveApplicationSchema`](./src/schema.ts): `approvalRouteId`, `currentStepOrder`, `approvedBy`, `returnedAt`, `returnedReason`. |
| Persistence | [`src/repository.ts`](./src/repository.ts) (`leaveApprovalRoutes`), migration [`0014_lam_approval_workflow.sql`](../../../../../packages/database/drizzle/0014_lam_approval_workflow.sql). |
| HTTP API | [`GET/POST /api/hr/leave/leave-approval-routes`](../../../../../apps/api/app/api/hr/leave/leave-approval-routes/route.ts), [`GET /api/hr/leave/leave-approval-routes/:routeId`](../../../../../apps/api/app/api/hr/leave/leave-approval-routes/[routeId]/route.ts), [`POST /api/hr/leave/leave-applications/:applicationId/route`](../../../../../apps/api/app/api/hr/leave/leave-applications/[applicationId]/route/route.ts). |
| Tests | [`test/leave-attendance-management-leave-approval-routing.test.ts`](./test/leave-attendance-management-leave-approval-routing.test.ts). |

| Seq 7 repair | Evidence |
| --- | --- |
| totalDays vs date range | [`assertTotalDaysMatchDateRange`](./src/projector/application-policy.ts) enforced on submit. |
| Blackout without hireDate gate | [`assertNotInBlackout`](./src/projector/application-policy.ts) runs with scope profile using `hireDate ?? startDate`. |
| Entitlement scope rejection test | Validation test for country scope mismatch. |
| Routing audit on submit | `leaveApplicationRouted` audit when auto-routed. |

---

## Slice 7 — Leave Application Validation (HRM-LAM-009 + HRM-LAM-010 + HRM-LAM-011)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-009** | System shall validate leave applications against available leave balance. | [`submitLamLeaveApplication`](./src/actions/leave-applications.action.ts) and [`finalizeLeaveApplicationApprovedBalance`](./src/shared/leave-application-balance.ts) via [`assertLeaveApplicationAvailableBalance`](./src/shared/leave-application-balance.ts). |
| **HRM-LAM-010** | System shall validate leave applications against leave eligibility rules. | [`assertLeaveTypeEligibility`](./src/projector/application-policy.ts), [`assertEntitlementRuleEligibility`](./src/projector/application-policy.ts) in submit action. |
| **HRM-LAM-011** | System shall validate minimum notice, max consecutive days, blackout dates, and overlapping leave. | [`assertNoticePeriod`](./src/projector/application-policy.ts), [`assertMaxConsecutiveDays`](./src/projector/application-policy.ts), [`assertNotInBlackout`](./src/projector/application-policy.ts), [`assertNoLeaveOverlap`](./src/projector/application-policy.ts). |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-007 | Leave application validates available balance before submission or approval. | Submit rejects when `remaining < totalDays`; final approve re-validates via [`assertLeaveApplicationAvailableBalance`](./src/shared/leave-application-balance.ts) before finalize; balance audit on successful submit. |
| AC-008 | Leave application validates eligibility, notice, max duration, blackout, and overlap. | [`assertLeaveApplicationPolicyGates`](./src/shared/leave-application-policy-validation.ts) on submit and amend; [`test/leave-attendance-management-leave-application-validation.test.ts`](./test/leave-attendance-management-leave-application-validation.test.ts). |

| AC-008 review (2026-06-10) | Result |
| --- | --- |
| Shared policy gates | [`assertLeaveApplicationPolicyGates`](./src/shared/leave-application-policy-validation.ts) centralizes HRM-LAM-010/011 checks for submit and amend. |
| Eligibility (HRM-LAM-010) | [`assertLeaveTypeEligibility`](./src/projector/application-policy.ts) (tenure, gender) + [`assertEntitlementRuleEligibility`](./src/projector/application-policy.ts) (scope dimensions) when `hireDate` supplied. |
| Notice / max duration / overlap / blackout (HRM-LAM-011) | [`assertNoticePeriod`](./src/projector/application-policy.ts), [`assertMaxConsecutiveDays`](./src/projector/application-policy.ts), [`assertNoLeaveOverlap`](./src/projector/application-policy.ts), [`assertNotInBlackout`](./src/projector/application-policy.ts); blackout scope uses `hireDate ?? startDate`. |
| Submit path | [`validateLeaveApplicationSubmission`](./src/actions/leave-applications.action.ts) → policy gates + balance (AC-007) + documents. |
| Amend path | [`amendLamLeaveApplication`](./src/actions/leave-application-lifecycle.action.ts) re-runs full policy gates with `evaluatedAt: amendedAt`; `gender` on amend input schema. |
| Client metadata | Extended [`lamLeaveTypeFieldLabels`](./src/shared/leave-type-policy-group.ts) with policy fields; [`lamLeaveBlackoutPeriodFieldLabels`](./src/shared/leave-application-policy-validation.ts); `gender` on submit field labels. |
| HTTP API | Submit and amend map policy validation failures to **422** via [`mapLamMutationHttpStatus`](../../../../../apps/api/app/api/hr/leave/_lib/mutation-response.ts). |
| Tests | Submit gate rejections + unit tests for overlap/blackout/notice boundary in validation suite; amend blackout and notice rejections in lifecycle suite. |

| AC-007 review (2026-06-10) | Result |
| --- | --- |
| Submit validation | [`assertLeaveApplicationAvailableBalance`](./src/shared/leave-application-balance.ts) with `phase: submit` — `remaining >= totalDays`; unpaid types bypass via [`shouldReserveLeaveBalance`](./src/projector/unpaid-leave-payroll-references.ts). |
| Approve validation | Final approval calls same helper with `phase: approve` — treats existing pending reservation as available (`remaining + totalDays >= totalDays`) before moving pending → used. |
| Shared formula | [`computeRemainingBalance`](./src/shared/balance.ts): `opening + earned + carriedForward + adjusted − used − pending − forfeited`. |
| Error semantics | Consistent `Insufficient leave balance: {remaining} day(s) remaining, {totalDays} requested` on submit and approve; missing balance via [`findLeaveApplicationBalance`](./src/shared/leave-application-balance.ts). |
| HTTP API | Submit and approve map balance failures to **422** via [`mapLamMutationHttpStatus`](../../../../../apps/api/app/api/hr/leave/_lib/mutation-response.ts). |
| Tests | Submit rejection in [`test/leave-attendance-management-leave-applications.test.ts`](./test/leave-attendance-management-leave-applications.test.ts) and validation suite; approve rejection after balance adjustment in [`test/leave-attendance-management-leave-application-decisions.test.ts`](./test/leave-attendance-management-leave-application-decisions.test.ts); phase helper unit test in validation suite. |

| Policy configuration | Evidence |
| --- | --- |
| Leave type policy fields | [`lamLeaveTypeSchema`](./src/schema.ts): `minNoticeDays`, `maxConsecutiveDays`, `eligibilityTenureMonthsMin`, `eligibilityGender`. |
| Blackout periods | [`lamLeaveBlackoutPeriodSchema`](./src/schema.ts), [`upsertLamLeaveBlackoutPeriod`](./src/actions/leave-blackout-periods.action.ts), migration [`0013_lam_leave_application_validation.sql`](../../../../../packages/database/drizzle/0013_lam_leave_application_validation.sql). |
| Employee profile on submit | [`submitLamLeaveApplicationInputSchema`](./src/contracts/command.contract.ts) accepts `hireDate`, `gender`, and scope dimensions for eligibility/blackout matching. |
| HTTP API | [`GET/POST /api/hr/leave/leave-blackout-periods`](../../../../../apps/api/app/api/hr/leave/leave-blackout-periods/route.ts), [`GET /api/hr/leave/leave-blackout-periods/:periodId`](../../../../../apps/api/app/api/hr/leave/leave-blackout-periods/[periodId]/route.ts). |

| Seq 6 repair (HRM-LAM-008) | Evidence |
| --- | --- |
| Document list route | [`GET /api/hr/leave/leave-documents`](../../../../../apps/api/app/api/hr/leave/leave-documents/route.ts) + route contract entry. |
| Confirm employee ownership | `confirmLamLeaveDocumentUpload` validates optional `employeeId` matches document owner. |
| Storage key sanitization | [`sanitizeLeaveDocumentFileName`](./src/projector/application-policy.ts) applied in upload session. |
| Fail-closed document read test | Query test verifies existing document returns `null` without read access. |

---

## Slice 6 — Supporting Document Reference on Leave Application (HRM-LAM-008)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-008** | System shall allow employees to attach supporting documents where required. | [`src/schema.ts`](./src/schema.ts) (`lamLeaveDocumentSchema`), [`src/actions/leave-documents.action.ts`](./src/actions/leave-documents.action.ts), [`src/queries/leave-documents.query.ts`](./src/queries/leave-documents.query.ts), [`src/actions/leave-applications.action.ts`](./src/actions/leave-applications.action.ts) (`resolveSupportingDocument`) |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-009 | Supporting document is required when leave policy requires it. | [`resolveSupportingDocument`](./src/shared/leave-application-document.ts) on submit; rejects missing/pending/wrong-owner/linked docs; accepts confirmed `available` document and links `leaveApplicationId`. |

| AC-009 review (2026-06-10) | Result |
| --- | --- |
| Policy gate | `leaveType.requiresDocument` enforced before submit; optional when `requiresDocument: false`. |
| Document lifecycle | Upload session → `pending_upload` + governed `storageKey`; confirm → `available`; submit links `leaveApplicationId`. |
| Validation rules | Missing ID, not found, wrong employee, non-`available` status, already linked, medical/hospitalization kind policy via [`assertLeaveDocumentSatisfiesMedicalLeavePolicy`](./src/projector/medical-leave-references.ts). |
| Shared module | [`resolveSupportingDocument`](./src/shared/leave-application-document.ts) extracted for submit and contract export. |
| Client metadata | `requiresDocument` on [`lamLeaveTypeFieldLabels`](./src/shared/leave-type-policy-group.ts); [`lamLeaveDocumentFieldLabels`](./src/shared/leave-application-document.ts) on `/metadata`, `/manifest`, `/contract`. |
| HTTP API | Submit, upload-session, and confirm map document validation failures to **422** via [`mapLamMutationHttpStatus`](../../../../../apps/api/app/api/hr/leave/_lib/mutation-response.ts). |
| Tests | Medical + maternity paths in [`test/leave-attendance-management-leave-applications.test.ts`](./test/leave-attendance-management-leave-applications.test.ts); unit tests in [`test/leave-attendance-management-leave-application-document.test.ts`](./test/leave-attendance-management-leave-application-document.test.ts); DB path in database integration suite. |

| Document lifecycle | Upload session creates `pending_upload` reference with governed `storageKey`. | [`createLamLeaveDocumentUploadSession`](./src/actions/leave-documents.action.ts) + audit `leaveDocumentReferenceCreated`. |
| Document confirmation | Employee confirms upload before application submit. | [`confirmLamLeaveDocumentUpload`](./src/actions/leave-documents.action.ts) transitions to `available` + audit `leaveDocumentUploadConfirmed`. |
| Persistence | Document metadata stored in repository and database. | [`src/repository.ts`](./src/repository.ts) (`leaveDocuments`), [`packages/database/drizzle/0012_lam_leave_documents.sql`](../../../../../packages/database/drizzle/0012_lam_leave_documents.sql) |
| HTTP API | Upload session, confirm, and read endpoints. | [`POST /api/hr/leave/leave-documents/upload-session`](../../../../../apps/api/app/api/hr/leave/leave-documents/upload-session/route.ts), [`POST /api/hr/leave/leave-documents/:documentId/confirm`](../../../../../apps/api/app/api/hr/leave/leave-documents/[documentId]/confirm/route.ts), [`GET /api/hr/leave/leave-documents/:documentId`](../../../../../apps/api/app/api/hr/leave/leave-documents/[documentId]/route.ts) |

| Seq 5 repair (HRM-LAM-007) | Evidence |
| --- | --- |
| Balance audit on submit | Submit emits `leaveBalanceUpdated` when incrementing `pending`. |
| High-risk submit audit | `leaveApplicationSubmitted` in high-risk audit events. |
| Expanded submit tests | Inactive leave type, missing balance, company mismatch, date filters, getById success. |

---

## Slice 5 — Employee Leave Application Submit (HRM-LAM-007)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-007** | System shall allow employees to submit leave applications. | [`src/actions/leave-applications.action.ts`](./src/actions/leave-applications.action.ts), [`src/queries/leave-applications.query.ts`](./src/queries/leave-applications.query.ts) |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-006 | Employee can submit leave application online. | [`submitLamLeaveApplication`](./src/actions/leave-applications.action.ts) creates `status: submitted` record with `submittedAt`; [`POST /api/hr/leave/leave-applications`](../../../../../apps/api/app/api/hr/leave/leave-applications/route.ts). |

| AC-006 review (2026-06-10) | Result |
| --- | --- |
| Domain submit | [`submitLamLeaveApplication`](./src/actions/leave-applications.action.ts) validates eligibility, balance, policy group, and documents; sets `status: submitted` + `submittedAt`; auto-routes to `pending_approval` when a matching approval route exists. |
| Employee self-service | [`requireLamEmployeeMutationScope`](./src/execution.ts) + `hr.lam.leave-applications.write` on employee persona; `scopedEmployeeId` must match `employeeId`. |
| Input contract | [`submitLamLeaveApplicationInputSchema`](./src/contracts/command.contract.ts) omits client `status`; [`bindEmployeeLeaveApplicationSubmitInput`](./src/shared/leave-application-submit.ts) binds self-scoped employee id. |
| Client metadata | [`lamLeaveApplicationSubmitFieldLabels`](./src/shared/leave-application-submit.ts) on `/metadata`, `/manifest`, and `/contract`. |
| HTTP API | `POST /api/hr/leave/leave-applications` binds `x-lam-scoped-employee-id` → `employeeId`, maps 403/422/400 on failure, returns 201 with `{ ok, targetId, application }`; [`mapLamMutationHttpStatus`](../../../../../apps/api/app/api/hr/leave/_lib/mutation-response.ts). |
| Tests | Employee persona submit in [`test/leave-attendance-management-permission-enforcement.test.ts`](./test/leave-attendance-management-permission-enforcement.test.ts); submit helpers in [`test/leave-attendance-management-leave-application-submit.test.ts`](./test/leave-attendance-management-leave-application-submit.test.ts); DB persistence in [`test/leave-attendance-management-database-integration.test.ts`](./test/leave-attendance-management-database-integration.test.ts). |

---

## Slice 4 — Leave Balance Ledger + Carry-Forward / Forfeiture (HRM-LAM-006 + HRM-LAM-019)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-006** | System shall maintain leave balances including opening, earned, used, pending, adjusted, forfeited, carried-forward, and remaining balance. | [`src/schema.ts`](./src/schema.ts) (`lamLeaveBalanceSchema`), [`src/shared/balance.ts`](./src/shared/balance.ts), [`src/queries/leave-balances.query.ts`](./src/queries/leave-balances.query.ts) |
| **HRM-LAM-018** | System shall support manual leave balance adjustment with reason and authorization. | [`src/actions/leave-balance-adjustment.action.ts`](./src/actions/leave-balance-adjustment.action.ts) |
| **HRM-LAM-019** | System shall support leave carry-forward and forfeiture rules. | [`src/schema.ts`](./src/schema.ts) (`lamLeaveCarryForwardRuleSchema`), [`src/projector/carry-forward.ts`](./src/projector/carry-forward.ts), [`src/queries/leave-carry-forward-rules.query.ts`](./src/queries/leave-carry-forward-rules.query.ts), [`src/actions/leave-carry-forward-rules.action.ts`](./src/actions/leave-carry-forward-rules.action.ts), [`src/actions/leave-balance-carry-forward.action.ts`](./src/actions/leave-balance-carry-forward.action.ts) |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-005 | Leave balance shows earned, used, pending, adjusted, carried-forward, forfeited, and remaining balance. | [`lamLeaveBalanceSchema`](./src/schema.ts) defines all seven ledger fields; [`listLamLeaveBalancesRecords`](./src/queries/leave-balances.query.ts) / [`getLamLeaveBalanceById`](./src/queries/leave-balances.query.ts) return full ledger with [`withComputedRemainingBalance`](./src/shared/balance.ts); [`lamLeaveBalanceFieldLabels`](./src/shared/balance.ts) on metadata/manifest/contract. |

| AC-005 review (2026-06-10) | Result |
| --- | --- |
| Ledger components | All seven AC fields stored, mutated by governed actions, and returned on list/get/API without field projection. |
| Remaining formula | `opening + earned + carriedForward + adjusted − used − pending − forfeited`; recomputed on read via `withComputedRemainingBalance`. |
| Carry-forward integrity | Source period closes with carry-out adjustment + forfeiture so carried days are not double-counted; target `carriedForward` accumulates additively. |
| Mutation paths | earned (entitlement apply), pending (submit), used (approve), adjusted (manual adjust), forfeited/carriedForward (carry-forward policy). |
| Client metadata | `lamLeaveBalanceFieldLabels` exported via `/metadata`, `/manifest`, and `/contract`. |
| Tests | Full ledger assertions in [`test/leave-attendance-management-leave-balances.test.ts`](./test/leave-attendance-management-leave-balances.test.ts) including submit → approve → adjust and year-end carry-forward. |
| AC-015 | Manual leave balance adjustment requires authorization and reason. | [`adjustLamLeaveBalance`](./src/actions/leave-balance-adjustment.action.ts) requires non-empty `reason` + `authorizedBy`; [`requireLamBalanceWriteAccess`](./src/execution.ts) + employee scope; audit metadata persisted; API route tests in [`apps/api/test/hr-lam-adjust-balance-route.test.ts`](../../../../../apps/api/test/hr-lam-adjust-balance-route.test.ts). |
| AC-016 | Leave carry-forward and forfeiture can be processed according to policy. | [`projectLeaveBalanceCarryForward`](./src/projector/carry-forward.ts) applies `maxCarryForwardDays` + `forfeitUnused` with most-specific rule selection; inactive/expired/scope-mismatched rules excluded; [`processLamLeaveBalanceCarryForward`](./src/actions/leave-balance-carry-forward.action.ts) writes source forfeiture and target carry-forward with separate audit events, skips target upsert/audit when `carryForwardDays === 0`; [`requireLamBalanceWriteAccess`](./src/execution.ts) + employee scope; rule CRUD via [`upsertLamLeaveCarryForwardRule`](./src/actions/leave-carry-forward-rules.action.ts); API routes use [`createLamBalanceWriteContext`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) / [`createLamWriteContext`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) with JSON guards; tests in [`test/leave-attendance-management-leave-balances.test.ts`](./test/leave-attendance-management-leave-balances.test.ts), [`test/leave-attendance-management-leave-carry-forward-rules.test.ts`](./test/leave-attendance-management-leave-carry-forward-rules.test.ts), [`apps/api/test/hr-lam-carry-forward-route.test.ts`](../../../../../apps/api/test/hr-lam-carry-forward-route.test.ts), and [`apps/api/test/hr-lam-carry-forward-rules-route.test.ts`](../../../../../apps/api/test/hr-lam-carry-forward-rules-route.test.ts). |

| Seq 4 repair | Evidence |
| --- | --- |
| Source balance forfeiture audit | Carry-forward action emits `leaveBalanceUpdated` for source period close (carry-out adjustment + forfeiture) when `carryForwardDays > 0` or `forfeitDays > 0`. |
| Carry-forward source close | Source `adjusted` reduced by `carryForwardDays` when closing period to prevent double-counting carried balance. |
| Target skip on zero carry | Target balance upsert and audit skipped when `carryForwardDays === 0`; `targetId` returns `null` when no target period balance exists. |
| Non-zero adjustment guard | `adjustmentDays` must be finite and non-zero in command schema. |

| Seq 3 repair (HRM-LAM-005) | Evidence |
| --- | --- |
| Null targetId when no rule matches | [`applyLamLeaveEntitlementCalculation`](./src/actions/leave-entitlement-calculation.action.ts) returns `targetId: null`. |
| Day-accurate hire-date prorata | [`monthsRemainingInPeriodYear`](./src/projector/entitlement.ts) uses actual days-in-month. |
| Scope dimensions in calculation audit | Apply action audit metadata includes employee scope fields. |
| Fail-closed API context defaults | [`apps/api/app/api/hr/leave/_lib/context.ts`](../../../../../apps/api/app/api/hr/leave/_lib/context.ts) defaults `canRead`/`canWrite` to `false`. |
| High-risk audit classification | `leaveEntitlementCalculated` and `leaveBalanceUpdated` in high-risk audit events. |

---

## Slice 3 — Leave Entitlement Calculation (HRM-LAM-005)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-005** | System shall calculate employee leave entitlement based on configured policy rules. | [`src/projector/entitlement.ts`](./src/projector/entitlement.ts), [`src/queries/leave-entitlement-calculation.query.ts`](./src/queries/leave-entitlement-calculation.query.ts), [`src/actions/leave-entitlement-calculation.action.ts`](./src/actions/leave-entitlement-calculation.action.ts) |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-004 | Leave entitlement calculated based on employee category, grade, tenure, location, legal entity, and country. | [`projectLeaveEntitlementCalculation`](./src/projector/entitlement.ts) matches all six AC dimensions plus tenure bounds; [`calculateLamLeaveEntitlement`](./src/queries/leave-entitlement-calculation.query.ts) loads configured rules and projects earned days; [`lamEntitlementScopeFieldLabels`](./src/shared/entitlement-scope.ts) documents dimension aliases for clients. |
| AC-005 | Leave entitlement can be calculated based on employee category, grade, tenure, location, legal entity, and country. | [`applyLamLeaveEntitlementCalculation`](./src/actions/leave-entitlement-calculation.action.ts) persists earned days to leave balance with audit trail. |

| Seq 2 repair (HRM-LAM-004) | Evidence |
| --- | --- |
| Effective date validation | [`assertEffectiveDateRange`](./src/actions/leave-entitlement-rules.action.ts) rejects `effectiveTo <= effectiveFrom`. |
| Department scope in audit | Entitlement rule upsert audit metadata includes `departmentId`. |
| Typed accrual rule | [`lamAccrualRuleSchema`](./src/schema.ts) with `annual_grant`, `monthly_accrual`, `hire_date_prorata`. |
| Effective-on list filter | [`listLamLeaveEntitlementRulesRecords`](./src/queries/leave-entitlement-rules.query.ts) accepts `effectiveOn` query parameter. |

---

## Slice 2 — Leave Entitlement Rule Configuration (HRM-LAM-004)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-004** | System shall configure leave entitlement rules by legal entity, country, location, employee type, grade, tenure, and policy group. | [`src/schema.ts`](./src/schema.ts) (`lamEntitlementRuleScopeSchema`, `lamLeaveEntitlementRuleSchema`), [`src/actions/leave-entitlement-rules.action.ts`](./src/actions/leave-entitlement-rules.action.ts), [`src/queries/leave-entitlement-rules.query.ts`](./src/queries/leave-entitlement-rules.query.ts) |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-004 | Leave entitlement can be configured based on employee category, grade, tenure, location, legal entity, and country. | [`upsertLamLeaveEntitlementRule`](./src/actions/leave-entitlement-rules.action.ts) accepts scope dimensions and tenure bounds; [`listLamLeaveEntitlementRulesRecords`](./src/queries/leave-entitlement-rules.query.ts) filters by each scope field including `employmentType` (employee category) and `workLocationCode` (location). |

---

## Slice 1 — Leave Type Configuration (HRM-LAM-003)

| Requirement | Description | Code Evidence |
| --- | --- | --- |
| **HRM-LAM-003** | System shall maintain leave types such as annual leave, medical leave, unpaid leave, maternity leave, paternity leave, compassionate leave, emergency leave, study leave, replacement leave, and hospitalization leave. | [`src/schema.ts`](./src/schema.ts) (`lamLeaveTypeKindValues`), [`src/actions/leave-types.action.ts`](./src/actions/leave-types.action.ts), [`src/queries/leave-types.query.ts`](./src/queries/leave-types.query.ts) |

| Acceptance Criteria | Evidence |
| --- | --- |
| AC-003 | Leave types can be configured by policy group. | [`upsertLamLeaveType`](./src/actions/leave-types.action.ts) accepts `policyGroupId`; [`listLamLeaveTypesRecords`](./src/queries/leave-types.query.ts) filters by `policyGroupId` (includes company-wide unscoped types) or `unscopedPolicyGroupOnly`; duplicate code uniqueness scoped to `(companyId, policyGroupId)` via [`leave-type-policy-group.ts`](./src/shared/leave-type-policy-group.ts). |

| AC-003 review (2026-06-10) | Result |
| --- | --- |
| Policy group configuration | Upsert normalizes and persists `policyGroupId`; get-by-id returns configured value; audit metadata includes `policyGroupId`. |
| List semantics | Filter by policy group returns group-specific plus unscoped (null) leave types; `unscopedPolicyGroupOnly` lists company-wide types only. |
| Uniqueness | Same code allowed across different policy groups; rejected within same company + policy group; DB migration `0020` enforces `(tenant, company, code, policy_group_id)`. |
| Client metadata | `lamLeaveTypeFieldLabels` exported via `/metadata`, `/manifest`, and `/contract`. |
| HTTP API | `GET /api/hr/leave/leave-types?policyGroupId=...&unscopedPolicyGroupOnly=true`; POST body accepts `policyGroupId`. |
| Tests | Integration in [`test/leave-attendance-management-leave-types.test.ts`](./test/leave-attendance-management-leave-types.test.ts); DB path in [`test/leave-attendance-management-database-integration.test.ts`](./test/leave-attendance-management-database-integration.test.ts). |
| Runtime access (2026-06-10) | [`assertLeaveTypeAccessibleToPolicyGroup`](./src/shared/leave-type-policy-group.ts) on submit and amend; unscoped types available to all groups; scoped types require matching employee `policyGroupId`. |

| AC-004 review (2026-06-10) — calculation | Result |
| --- | --- |
| Dimension mapping | Employee category = `employmentType`; location = `workLocationCode`; tenure via `hireDate` + rule `tenureMonthsMin`/`tenureMonthsMax`; legal entity = `legalEntityCode`; country = `countryCode`. |
| Projector matching | [`matchesEntitlementRuleScope`](./src/projector/entitlement.ts) and [`matchesEntitlementRuleTenure`](./src/projector/entitlement.ts) gate rule selection; most-specific rule wins. |
| Calculate / apply | [`calculateLamLeaveEntitlement`](./src/queries/leave-entitlement-calculation.query.ts) and [`applyLamLeaveEntitlementCalculation`](./src/actions/leave-entitlement-calculation.action.ts) accept full employee profile; audit metadata records scope dimensions. |
| Client metadata | [`lamEntitlementScopeFieldLabels`](./src/shared/entitlement-scope.ts) and `employeeCategory` → `employmentType` alias on `/metadata`, `/manifest`, `/contract`. |
| Negative coverage | Per-dimension mismatch and tenure-bound rejection tests in [`test/leave-attendance-management-leave-entitlement-calculation.test.ts`](./test/leave-attendance-management-leave-entitlement-calculation.test.ts). |
| Profile resolution | Employee attributes supplied by orchestration caller (`employeeId` does not auto-resolve from employee master — owned outside LAM per architecture exclusions). |

---

# Leave & Attendance Management Includes

| Area                              | What It Covers                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Attendance Records**            | Daily attendance status, present, absent, late, early out, half-day, missing punch                                  |
| **Leave Entitlement**             | Annual leave, medical leave, unpaid leave, maternity leave, paternity leave, compassionate leave, replacement leave |
| **Leave Balance**                 | Opening balance, earned leave, used leave, pending leave, adjusted leave, forfeited leave, carried-forward leave    |
| **Leave Application**             | Leave request, leave type, leave dates, reason, supporting document, approval status                                |
| **Leave Approval Workflow**       | Manager approval, HR approval, multi-level approval, delegation, escalation                                         |
| **Leave Policy Enforcement**      | Eligibility, entitlement rules, minimum notice period, blackout dates, maximum consecutive days                     |
| **Attendance Policy Enforcement** | Lateness rule, early departure rule, absence rule, grace period, workday rule                                       |
| **Holiday Calendar Reference**    | Public holiday, company holiday, regional holiday, replacement holiday                                              |
| **Work Calendar Reference**       | Working day, rest day, off day, weekend, company calendar                                                           |
| **Attendance Exception Handling** | Missing clock-in, missing clock-out, late arrival, early departure, unapproved absence                              |
| **Leave Adjustment**              | Manual adjustment, carry-forward adjustment, forfeiture, correction, encashment reference                           |
| **Medical Leave Tracking**        | Medical certificate reference, panel clinic reference, hospitalization reference                                    |
| **Unpaid Leave Tracking**         | Unpaid leave duration, payroll deduction reference, approval status                                                 |
| **Absence Tracking**              | Approved absence, unapproved absence, no-show, emergency leave, extended absence                                    |
| **Attendance Summary**            | Days worked, leave taken, absent days, late count, early-out count                                                  |
| **Payroll Integration**           | Approved unpaid leave, attendance deductions, overtime reference, absence deduction reference                       |
| **Audit Trail**                   | Submitted by, approved by, rejected by, adjusted by, timestamp, reason, evidence                                    |

---

# Leave & Attendance Management Does Not Include

| Excluded Area                               | Owned By                           |
| ------------------------------------------- | ---------------------------------- |
| Employee master profile                     | Employee Records Management        |
| Organization hierarchy                      | Organizational Chart & Hierarchy   |
| Payroll calculation                         | Payroll Processing                 |
| Overtime rate configuration and calculation | Overtime Management                |
| Shift pattern design                        | Shift Scheduling                   |
| Physical time clock device integration      | Time Clock Integration             |
| GPS-based clock-in/out                      | Geolocation & Remote Check-In      |
| Absence trend analytics                     | Absence Analytics & Trends         |
| Hybrid/remote work schedule policy          | Flexible Work Arrangement Tracking |
| Final salary computation                    | Payroll Processing                 |
| Benefits enrollment                         | Benefits Administration            |
| Expense claims                              | Expense Reimbursement              |
| Performance review                          | Performance Management             |
| Compliance case handling                    | Compliance & Regulatory Tracking   |

---

# Leave & Attendance Management Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Leave & Attendance Management** | Tracks employee attendance, manages leave entitlement, leave requests, leave balances, attendance exceptions, absence records, approval workflows, policy enforcement, payroll-ready attendance outcomes, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-LAM-001** | System shall maintain employee attendance records by employee, date, work calendar, and attendance status.                                                                                                              |
| **HRM-LAM-002** | System shall support attendance statuses including present, absent, late, early out, half-day, rest day, off day, public holiday, and missing punch.                                                                    |
| **HRM-LAM-003** | System shall maintain leave types such as annual leave, medical leave, unpaid leave, maternity leave, paternity leave, compassionate leave, emergency leave, study leave, replacement leave, and hospitalization leave. |
| **HRM-LAM-004** | System shall configure leave entitlement rules by legal entity, country, location, employee type, grade, tenure, and policy group.                                                                                      |
| **HRM-LAM-005** | System shall calculate employee leave entitlement based on configured policy rules.                                                                                                                                     |
| **HRM-LAM-006** | System shall maintain leave balances including opening, earned, used, pending, adjusted, forfeited, carried-forward, and remaining balance.                                                                             |
| **HRM-LAM-007** | System shall allow employees to submit leave applications.                                                                                                                                                              |
| **HRM-LAM-008** | System shall allow employees to attach supporting documents where required.                                                                                                                                             |
| **HRM-LAM-009** | System shall validate leave applications against available leave balance.                                                                                                                                               |
| **HRM-LAM-010** | System shall validate leave applications against leave eligibility rules.                                                                                                                                               |
| **HRM-LAM-011** | System shall validate leave applications against minimum notice period, maximum consecutive leave days, blackout dates, and overlapping leave.                                                                          |
| **HRM-LAM-012** | System shall route leave applications through approval workflow.                                                                                                                                                        |
| **HRM-LAM-013** | System shall support approval routing by manager, HR, department, leave type, duration, and employee grade.                                                                                                             |
| **HRM-LAM-014** | System shall allow approvers to approve, reject, return, or request clarification for leave applications.                                                                                                               |
| **HRM-LAM-015** | System shall require rejection reason for rejected leave applications.                                                                                                                                                  |
| **HRM-LAM-016** | System shall update leave balance after leave approval, cancellation, adjustment, or reversal.                                                                                                                          |
| **HRM-LAM-017** | System shall support leave cancellation and amendment based on policy.                                                                                                                                                  |
| **HRM-LAM-018** | System shall support manual leave balance adjustment with reason and authorization.                                                                                                                                     |
| **HRM-LAM-019** | System shall support leave carry-forward and forfeiture rules.                                                                                                                                                          |
| **HRM-LAM-020** | System shall track unpaid leave and expose payroll deduction reference to Payroll Processing.                                                                                                                           |
| **HRM-LAM-021** | System shall track medical leave with medical certificate reference where required.                                                                                                                                     |
| **HRM-LAM-022** | System shall detect attendance exceptions such as late arrival, early departure, absence, and missing punch.                                                                                                            |
| **HRM-LAM-023** | System shall allow attendance exception correction requests where enabled.                                                                                                                                              |
| **HRM-LAM-024** | System shall route attendance correction requests through approval workflow.                                                                                                                                            |
| **HRM-LAM-025** | System shall summarize attendance by employee, department, manager, legal entity, work location, and period.                                                                                                            |
| **HRM-LAM-026** | System shall expose approved leave, unpaid leave, absence, lateness, and attendance deduction references to Payroll Processing.                                                                                         |
| **HRM-LAM-027** | System shall restrict leave and attendance records based on employee, manager, HR, payroll, and auditor permissions.                                                                                                    |
| **HRM-LAM-028** | System shall notify employees and approvers of submitted, approved, rejected, cancelled, overdue, and returned leave or attendance requests.                                                                            |
| **HRM-LAM-029** | System shall provide leave and attendance reports by employee, department, leave type, attendance status, manager, location, legal entity, and period.                                                                  |
| **HRM-LAM-030** | System shall maintain audit trail for leave entitlement, leave application, approval, rejection, cancellation, adjustment, attendance correction, exception handling, and payroll integration.                          |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                          |
| --: | ---------------------------------------------------------------------------------------------------------------------------- |
|   1 | Employee attendance record can be maintained by employee and date.                                                           |
|   2 | Attendance status can show present, absent, late, early out, half-day, rest day, off day, holiday, or missing punch.         |
|   3 | Leave types can be configured by policy group.                                                                               |
|   4 | Leave entitlement can be calculated based on employee category, grade, tenure, location, legal entity, and country.          |
|   5 | Leave balance shows earned, used, pending, adjusted, carried-forward, forfeited, and remaining balance.                      |
|   6 | Employee can submit leave application online.                                                                                |
|   7 | Leave application validates available balance before submission or approval.                                                 |
|   8 | Leave application validates eligibility, minimum notice period, maximum duration, blackout dates, and overlapping leave.     |
|   9 | Supporting document is required when leave policy requires it.                                                               |
|  10 | Leave application follows configured approval workflow.                                                                      |
|  11 | Approver can approve, reject, return, or request clarification.                                                              |
|  12 | Rejected leave application stores rejection reason.                                                                          |
|  13 | Approved leave updates leave balance.                                                                                        |
|  14 | Leave cancellation or amendment updates leave balance correctly.                                                             |
|  15 | Manual leave balance adjustment requires authorization and reason.                                                           |
|  16 | Leave carry-forward and forfeiture can be processed according to policy.                                                     |
|  17 | Unpaid leave is exposed to Payroll Processing for deduction reference.                                                       |
|  18 | Attendance exceptions such as late, early out, absent, and missing punch are flagged.                                        |
|  19 | Attendance correction request can be submitted and approved where enabled.                                                   |
|  20 | Approved attendance and leave outcomes are available for payroll processing.                                                 |
|  21 | Employees can view their own leave balance, leave history, and attendance summary.                                           |
|  22 | Managers can view team leave calendar and attendance exceptions where authorized.                                            |
|  23 | Unauthorized users cannot view or modify restricted leave and attendance records.                                            |
|  24 | Leave and attendance reports can be generated by employee, department, leave type, status, location, and period.             |
|  25 | Every leave, attendance, correction, approval, rejection, adjustment, and payroll integration action creates an audit event. |
