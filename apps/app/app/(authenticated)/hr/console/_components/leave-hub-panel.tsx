"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatDateInputValue, formatApprovalRouteStepsSummary } from "../_lam-form-utils.ts";
import type { LamConfigActionState } from "../_lam-config-actions.ts";
import {
  toggleApprovalRouteActiveAction,
  toggleBlackoutPeriodActiveAction,
  toggleEntitlementRuleActiveAction,
  toggleLeaveTypeActiveAction,
  upsertApprovalRouteAction,
  upsertBlackoutPeriodAction,
  upsertEntitlementRuleAction,
  upsertLeaveTypeAction,
} from "../_lam-config-actions.ts";
import { LamRowToggleForm } from "./lam-row-toggle-form.tsx";
import { LamApprovalRouteStepsEditor } from "./lam-approval-route-steps-editor.tsx";

const initialState: LamConfigActionState = {
  ok: false,
  message: "",
};

const fieldClassName =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const labelClassName = "block font-medium text-sm";
const buttonClassName =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:opacity-50";
const linkClassName = "text-primary text-xs underline";

type LeaveTypeRow = {
  active: boolean;
  code: string;
  id: string;
  kind: string;
  name: string;
  paid: boolean;
};

type EntitlementRuleRow = {
  active: boolean;
  code: string;
  effectiveFrom: Date | string;
  entitlementDays: number;
  id: string;
  leaveTypeId: string;
  title: string;
};

type BlackoutRow = {
  active: boolean;
  code: string;
  endDate: Date | string;
  id: string;
  leaveTypeId?: string | null;
  reason: string;
  startDate: Date | string;
  title: string;
};

type ApprovalRouteRow = {
  active: boolean;
  code: string;
  id: string;
  leaveTypeId?: string | null;
  maxDurationDays?: number | null;
  minDurationDays?: number | null;
  scope?: {
    countryCode?: string | null;
    departmentId?: string | null;
    employmentType?: string | null;
    grade?: string | null;
    legalEntityCode?: string | null;
    policyGroupId?: string | null;
    workLocationCode?: string | null;
  } | null;
  steps: readonly {
    approverRef?: string | null;
    fallbackToHr?: boolean;
    kind: "direct_manager" | "department_head" | "hr_officer" | "named_approver";
    label?: string | null;
    order: number;
  }[];
  title: string;
};

type LeaveHubPanelProps = {
  approvalRoutes: readonly ApprovalRouteRow[];
  blackoutPeriods: readonly BlackoutRow[];
  canWrite: boolean;
  editApprovalRouteId?: string;
  editBlackoutId?: string;
  editEntitlementId?: string;
  editLeaveTypeId?: string;
  entitlementRules: readonly EntitlementRuleRow[];
  leaveTypes: readonly LeaveTypeRow[];
};

export const LeaveHubPanel = ({
  approvalRoutes,
  blackoutPeriods,
  canWrite,
  editApprovalRouteId,
  editBlackoutId,
  editEntitlementId,
  editLeaveTypeId,
  entitlementRules,
  leaveTypes,
}: LeaveHubPanelProps) => {
  const editingLeaveType =
    leaveTypes.find((entry) => entry.id === editLeaveTypeId) ?? null;
  const editingEntitlement =
    entitlementRules.find((entry) => entry.id === editEntitlementId) ?? null;
  const editingBlackout =
    blackoutPeriods.find((entry) => entry.id === editBlackoutId) ?? null;
  const editingApprovalRoute =
    approvalRoutes.find((entry) => entry.id === editApprovalRouteId) ?? null;

  const [leaveTypeState, leaveTypeAction, leaveTypePending] = useActionState(
    upsertLeaveTypeAction,
    initialState
  );
  const [entitlementState, entitlementAction, entitlementPending] =
    useActionState(upsertEntitlementRuleAction, initialState);
  const [blackoutState, blackoutAction, blackoutPending] = useActionState(
    upsertBlackoutPeriodAction,
    initialState
  );
  const [approvalState, approvalAction, approvalPending] = useActionState(
    upsertApprovalRouteAction,
    initialState
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">Leave types</h2>
        {leaveTypes.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">No leave types yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Kind</th>
                  <th className="py-2 pr-4">Paid</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((leaveType) => (
                  <tr className="border-border/60 border-b" key={leaveType.id}>
                    <td className="py-2 pr-4 font-mono">{leaveType.code}</td>
                    <td className="py-2 pr-4">{leaveType.name}</td>
                    <td className="py-2 pr-4">{leaveType.kind}</td>
                    <td className="py-2 pr-4">{leaveType.paid ? "Yes" : "No"}</td>
                    <td className="py-2 pr-4">
                      {leaveType.active ? "Yes" : "No"}
                    </td>
                    {canWrite ? (
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Link
                            className={linkClassName}
                            href={`/hr/console/leave?editLeaveType=${leaveType.id}`}
                          >
                            Edit
                          </Link>
                          <LamRowToggleForm
                            action={toggleLeaveTypeActiveAction}
                            active={leaveType.active}
                            id={leaveType.id}
                          />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canWrite ? (
          <form action={leaveTypeAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <h3 className="font-medium md:col-span-2">
              {editingLeaveType ? "Edit leave type" : "Create leave type"}
            </h3>
            {editingLeaveType ? (
              <input name="id" type="hidden" value={editingLeaveType.id} />
            ) : null}
            <label className={labelClassName}>
              Code
              <input
                className={fieldClassName}
                defaultValue={editingLeaveType?.code}
                name="code"
                required
              />
            </label>
            <label className={labelClassName}>
              Name
              <input
                className={fieldClassName}
                defaultValue={editingLeaveType?.name}
                name="name"
                required
              />
            </label>
            <label className={labelClassName}>
              Kind
              <select
                className={fieldClassName}
                defaultValue={editingLeaveType?.kind ?? "annual"}
                name="kind"
              >
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="unpaid">Unpaid</option>
                <option value="special">Special</option>
              </select>
            </label>
            <label className="flex items-center gap-2 self-end font-medium text-sm">
              <input
                defaultChecked={editingLeaveType?.paid ?? true}
                name="paid"
                type="checkbox"
              />
              Paid leave
            </label>
            <label className="flex items-center gap-2 self-end font-medium text-sm">
              <input
                defaultChecked={editingLeaveType?.active ?? true}
                name="active"
                type="checkbox"
              />
              Active
            </label>
            <div className="md:col-span-2">
              <button
                className={buttonClassName}
                disabled={leaveTypePending}
                type="submit"
              >
                {leaveTypePending ? "Saving…" : "Save leave type"}
              </button>
              {leaveTypeState.message ? (
                <p
                  className={`mt-2 text-sm ${leaveTypeState.ok ? "text-green-600" : "text-destructive"}`}
                >
                  {leaveTypeState.message}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">
          Entitlement rules
        </h2>
        {entitlementRules.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">No entitlement rules yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Leave type</th>
                  <th className="py-2 pr-4">Days</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {entitlementRules.map((rule) => (
                  <tr className="border-border/60 border-b" key={rule.id}>
                    <td className="py-2 pr-4 font-mono">{rule.code}</td>
                    <td className="py-2 pr-4">{rule.title}</td>
                    <td className="py-2 pr-4 font-mono">{rule.leaveTypeId}</td>
                    <td className="py-2 pr-4">{rule.entitlementDays}</td>
                    <td className="py-2 pr-4">{rule.active ? "Yes" : "No"}</td>
                    {canWrite ? (
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Link
                            className={linkClassName}
                            href={`/hr/console/leave?editEntitlement=${rule.id}`}
                          >
                            Edit
                          </Link>
                          <LamRowToggleForm
                            action={toggleEntitlementRuleActiveAction}
                            active={rule.active}
                            id={rule.id}
                          />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canWrite ? (
          <form action={entitlementAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <h3 className="font-medium md:col-span-2">
              {editingEntitlement
                ? "Edit entitlement rule"
                : "Create entitlement rule"}
            </h3>
            {editingEntitlement ? (
              <input name="id" type="hidden" value={editingEntitlement.id} />
            ) : null}
            <label className={labelClassName}>
              Code
              <input
                className={fieldClassName}
                defaultValue={editingEntitlement?.code}
                name="code"
                required
              />
            </label>
            <label className={labelClassName}>
              Title
              <input
                className={fieldClassName}
                defaultValue={editingEntitlement?.title}
                name="title"
                required
              />
            </label>
            <label className={labelClassName}>
              Leave type
              <select
                className={fieldClassName}
                defaultValue={editingEntitlement?.leaveTypeId}
                name="leaveTypeId"
                required
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((leaveType) => (
                  <option key={leaveType.id} value={leaveType.id}>
                    {leaveType.code} — {leaveType.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClassName}>
              Entitlement days
              <input
                className={fieldClassName}
                defaultValue={editingEntitlement?.entitlementDays}
                min={0}
                name="entitlementDays"
                required
                type="number"
              />
            </label>
            <label className={labelClassName}>
              Effective from
              <input
                className={fieldClassName}
                defaultValue={
                  editingEntitlement
                    ? formatDateInputValue(editingEntitlement.effectiveFrom)
                    : undefined
                }
                name="effectiveFrom"
                required
                type="date"
              />
            </label>
            <label className="flex items-center gap-2 self-end font-medium text-sm">
              <input
                defaultChecked={editingEntitlement?.active ?? true}
                name="active"
                type="checkbox"
              />
              Active
            </label>
            <div className="md:col-span-2">
              <button
                className={buttonClassName}
                disabled={entitlementPending}
                type="submit"
              >
                {entitlementPending ? "Saving…" : "Save entitlement rule"}
              </button>
              {entitlementState.message ? (
                <p
                  className={`mt-2 text-sm ${entitlementState.ok ? "text-green-600" : "text-destructive"}`}
                >
                  {entitlementState.message}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">Blackout periods</h2>
        {blackoutPeriods.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">No blackout periods yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Reason</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {blackoutPeriods.map((period) => (
                  <tr className="border-border/60 border-b" key={period.id}>
                    <td className="py-2 pr-4 font-mono">{period.code}</td>
                    <td className="py-2 pr-4">{period.title}</td>
                    <td className="py-2 pr-4">{period.reason}</td>
                    <td className="py-2 pr-4">{period.active ? "Yes" : "No"}</td>
                    {canWrite ? (
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Link
                            className={linkClassName}
                            href={`/hr/console/leave?editBlackout=${period.id}`}
                          >
                            Edit
                          </Link>
                          <LamRowToggleForm
                            action={toggleBlackoutPeriodActiveAction}
                            active={period.active}
                            id={period.id}
                          />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canWrite ? (
          <form action={blackoutAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <h3 className="font-medium md:col-span-2">
              {editingBlackout ? "Edit blackout period" : "Create blackout period"}
            </h3>
            {editingBlackout ? (
              <input name="id" type="hidden" value={editingBlackout.id} />
            ) : null}
            <label className={labelClassName}>
              Code
              <input
                className={fieldClassName}
                defaultValue={editingBlackout?.code}
                name="code"
                required
              />
            </label>
            <label className={labelClassName}>
              Title
              <input
                className={fieldClassName}
                defaultValue={editingBlackout?.title}
                name="title"
                required
              />
            </label>
            <label className={labelClassName}>
              Leave type (optional)
              <select
                className={fieldClassName}
                defaultValue={editingBlackout?.leaveTypeId ?? ""}
                name="leaveTypeId"
              >
                <option value="">All leave types</option>
                {leaveTypes.map((leaveType) => (
                  <option key={leaveType.id} value={leaveType.id}>
                    {leaveType.code}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClassName}>
              Start date
              <input
                className={fieldClassName}
                defaultValue={
                  editingBlackout
                    ? formatDateInputValue(editingBlackout.startDate)
                    : undefined
                }
                name="startDate"
                required
                type="date"
              />
            </label>
            <label className={labelClassName}>
              End date
              <input
                className={fieldClassName}
                defaultValue={
                  editingBlackout
                    ? formatDateInputValue(editingBlackout.endDate)
                    : undefined
                }
                name="endDate"
                required
                type="date"
              />
            </label>
            <label className={`${labelClassName} md:col-span-2`}>
              Reason
              <input
                className={fieldClassName}
                defaultValue={editingBlackout?.reason}
                name="reason"
                required
              />
            </label>
            <label className="flex items-center gap-2 self-end font-medium text-sm">
              <input
                defaultChecked={editingBlackout?.active ?? true}
                name="active"
                type="checkbox"
              />
              Active
            </label>
            <div className="md:col-span-2">
              <button
                className={buttonClassName}
                disabled={blackoutPending}
                type="submit"
              >
                {blackoutPending ? "Saving…" : "Save blackout period"}
              </button>
              {blackoutState.message ? (
                <p
                  className={`mt-2 text-sm ${blackoutState.ok ? "text-green-600" : "text-destructive"}`}
                >
                  {blackoutState.message}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">Approval routes</h2>
        {approvalRoutes.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">No approval routes yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Leave type</th>
                  <th className="py-2 pr-4">Steps</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {approvalRoutes.map((route) => (
                  <tr className="border-border/60 border-b" key={route.id}>
                    <td className="py-2 pr-4 font-mono">{route.code}</td>
                    <td className="py-2 pr-4">{route.title}</td>
                    <td className="py-2 pr-4 font-mono">
                      {route.leaveTypeId ?? "All"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatApprovalRouteStepsSummary(route.steps)}
                    </td>
                    <td className="py-2 pr-4">{route.active ? "Yes" : "No"}</td>
                    {canWrite ? (
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Link
                            className={linkClassName}
                            href={`/hr/console/leave?editApproval=${route.id}`}
                          >
                            Edit
                          </Link>
                          <LamRowToggleForm
                            action={toggleApprovalRouteActiveAction}
                            active={route.active}
                            id={route.id}
                          />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canWrite ? (
          <form action={approvalAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <h3 className="font-medium md:col-span-2">
              {editingApprovalRoute
                ? "Edit approval route"
                : "Create approval route"}
            </h3>
            {editingApprovalRoute ? (
              <input name="id" type="hidden" value={editingApprovalRoute.id} />
            ) : null}
            <label className={labelClassName}>
              Code
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.code}
                name="code"
                required
              />
            </label>
            <label className={labelClassName}>
              Title
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.title}
                name="title"
                required
              />
            </label>
            <label className={labelClassName}>
              Leave type (optional)
              <select
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.leaveTypeId ?? ""}
                name="leaveTypeId"
              >
                <option value="">All leave types</option>
                {leaveTypes.map((leaveType) => (
                  <option key={leaveType.id} value={leaveType.id}>
                    {leaveType.code}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end font-medium text-sm">
              <input
                defaultChecked={editingApprovalRoute?.active ?? true}
                name="active"
                type="checkbox"
              />
              Active
            </label>
            <label className={labelClassName}>
              Min duration (days)
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.minDurationDays ?? ""}
                min={0}
                name="minDurationDays"
                type="number"
              />
            </label>
            <label className={labelClassName}>
              Max duration (days)
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.maxDurationDays ?? ""}
                min={1}
                name="maxDurationDays"
                type="number"
              />
            </label>
            <label className={labelClassName}>
              Scope country code
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.countryCode ?? ""}
                name="scopeCountryCode"
              />
            </label>
            <label className={labelClassName}>
              Scope legal entity
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.legalEntityCode ?? ""}
                name="scopeLegalEntityCode"
              />
            </label>
            <label className={labelClassName}>
              Scope work location
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.workLocationCode ?? ""}
                name="scopeWorkLocationCode"
              />
            </label>
            <label className={labelClassName}>
              Scope employment type
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.employmentType ?? ""}
                name="scopeEmploymentType"
              />
            </label>
            <label className={labelClassName}>
              Scope grade
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.grade ?? ""}
                name="scopeGrade"
              />
            </label>
            <label className={labelClassName}>
              Scope department ID
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.departmentId ?? ""}
                name="scopeDepartmentId"
              />
            </label>
            <label className={labelClassName}>
              Scope policy group ID
              <input
                className={fieldClassName}
                defaultValue={editingApprovalRoute?.scope?.policyGroupId ?? ""}
                name="scopePolicyGroupId"
              />
            </label>
            <LamApprovalRouteStepsEditor
              initialSteps={editingApprovalRoute?.steps}
            />
            <div className="md:col-span-2">
              <button
                className={buttonClassName}
                disabled={approvalPending}
                type="submit"
              >
                {approvalPending ? "Saving…" : "Save approval route"}
              </button>
              {approvalState.message ? (
                <p
                  className={`mt-2 text-sm ${approvalState.ok ? "text-green-600" : "text-destructive"}`}
                >
                  {approvalState.message}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
};
