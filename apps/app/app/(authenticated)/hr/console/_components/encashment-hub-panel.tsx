"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatDateInputValue } from "../_lam-form-utils.ts";
import type { LamConfigActionState } from "../_lam-config-actions.ts";
import {
  processEncashmentAction,
  toggleEncashmentPolicyActiveAction,
  upsertEncashmentPolicyAction,
} from "../_lam-config-actions.ts";
import { LamRowToggleForm } from "./lam-row-toggle-form.tsx";

const initialState: LamConfigActionState = {
  ok: false,
  message: "",
};

const fieldClassName =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const labelClassName = "block font-medium text-sm";
const buttonClassName =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:opacity-50";

type EncashmentPolicyRow = {
  active: boolean;
  code: string;
  effectiveFrom: Date | string;
  encashmentRatePercent: number;
  id: string;
  leaveTypeId: string;
  maxEncashableDays: number;
  minRemainingBalanceDays?: number | null;
  title: string;
};

type LeaveTypeOption = {
  code: string;
  id: string;
  name: string;
};

type EncashmentHubPanelProps = {
  canWrite: boolean;
  editPolicyId?: string;
  leaveTypes: readonly LeaveTypeOption[];
  policies: readonly EncashmentPolicyRow[];
};

export const EncashmentHubPanel = ({
  canWrite,
  editPolicyId,
  leaveTypes,
  policies,
}: EncashmentHubPanelProps) => {
  const editingPolicy =
    policies.find((policy) => policy.id === editPolicyId) ?? null;
  const [policyState, policyAction, policyPending] = useActionState(
    upsertEncashmentPolicyAction,
    initialState
  );
  const [processState, processAction, processPending] = useActionState(
    processEncashmentAction,
    initialState
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">
          Encashment policies
        </h2>
        {policies.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">
            No encashment policies configured yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Leave type</th>
                  <th className="py-2 pr-4">Max days</th>
                  <th className="py-2 pr-4">Rate %</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr className="border-border/60 border-b" key={policy.id}>
                    <td className="py-2 pr-4 font-mono">{policy.code}</td>
                    <td className="py-2 pr-4">{policy.title}</td>
                    <td className="py-2 pr-4 font-mono">{policy.leaveTypeId}</td>
                    <td className="py-2 pr-4">{policy.maxEncashableDays}</td>
                    <td className="py-2 pr-4">{policy.encashmentRatePercent}</td>
                    <td className="py-2 pr-4">{policy.active ? "Yes" : "No"}</td>
                    {canWrite ? (
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Link
                            className="text-primary text-xs underline"
                            href={`/hr/console/encashment?editPolicy=${policy.id}`}
                          >
                            Edit
                          </Link>
                          <LamRowToggleForm
                            action={toggleEncashmentPolicyActiveAction}
                            active={policy.active}
                            id={policy.id}
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
      </section>

      {canWrite ? (
        <>
          <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
            <h2 className="font-semibold text-xl tracking-tight">
              {editingPolicy
                ? "Edit encashment policy"
                : "Create encashment policy"}
            </h2>
            <form action={policyAction} className="mt-4 grid gap-4 md:grid-cols-2">
              {editingPolicy ? (
                <input name="id" type="hidden" value={editingPolicy.id} />
              ) : null}
              <label className={labelClassName}>
                Code
                <input
                  className={fieldClassName}
                  defaultValue={editingPolicy?.code}
                  name="code"
                  required
                />
              </label>
              <label className={labelClassName}>
                Title
                <input
                  className={fieldClassName}
                  defaultValue={editingPolicy?.title}
                  name="title"
                  required
                />
              </label>
              <label className={labelClassName}>
                Leave type
                <select
                  className={fieldClassName}
                  defaultValue={editingPolicy?.leaveTypeId}
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
                Max encashable days
                <input
                  className={fieldClassName}
                  defaultValue={editingPolicy?.maxEncashableDays}
                  min={0}
                  name="maxEncashableDays"
                  required
                  step="0.5"
                  type="number"
                />
              </label>
              <label className={labelClassName}>
                Encashment rate %
                <input
                  className={fieldClassName}
                  defaultValue={editingPolicy?.encashmentRatePercent}
                  max={100}
                  min={0}
                  name="encashmentRatePercent"
                  required
                  type="number"
                />
              </label>
              <label className={labelClassName}>
                Min remaining balance days
                <input
                  className={fieldClassName}
                  defaultValue={editingPolicy?.minRemainingBalanceDays ?? undefined}
                  min={0}
                  name="minRemainingBalanceDays"
                  step="0.5"
                  type="number"
                />
              </label>
              <label className={labelClassName}>
                Effective from
                <input
                  className={fieldClassName}
                  defaultValue={
                    editingPolicy
                      ? formatDateInputValue(editingPolicy.effectiveFrom)
                      : undefined
                  }
                  name="effectiveFrom"
                  required
                  type="date"
                />
              </label>
              <label className="flex items-center gap-2 self-end font-medium text-sm">
                <input
                  defaultChecked={editingPolicy?.active ?? true}
                  name="active"
                  type="checkbox"
                />
                Active
              </label>
              <div className="md:col-span-2">
                <button
                  className={buttonClassName}
                  disabled={policyPending}
                  type="submit"
                >
                  {policyPending ? "Saving…" : "Save policy"}
                </button>
                {policyState.message ? (
                  <p
                    className={`mt-2 text-sm ${policyState.ok ? "text-green-600" : "text-destructive"}`}
                  >
                    {policyState.message}
                  </p>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
            <h2 className="font-semibold text-xl tracking-tight">
              Process leave encashment
            </h2>
            <form
              action={processAction}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              <label className={labelClassName}>
                Employee ID
                <input className={fieldClassName} name="employeeId" required />
              </label>
              <label className={labelClassName}>
                Policy
                <select className={fieldClassName} name="policyId" required>
                  <option value="">Select policy</option>
                  {policies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.code} — {policy.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Leave type
                <select className={fieldClassName} name="leaveTypeId" required>
                  <option value="">Select leave type</option>
                  {leaveTypes.map((leaveType) => (
                    <option key={leaveType.id} value={leaveType.id}>
                      {leaveType.code} — {leaveType.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Period year
                <input
                  className={fieldClassName}
                  defaultValue={new Date().getFullYear()}
                  name="periodYear"
                  required
                  type="number"
                />
              </label>
              <label className={labelClassName}>
                Encashment days
                <input
                  className={fieldClassName}
                  min={0.5}
                  name="encashmentDays"
                  required
                  step="0.5"
                  type="number"
                />
              </label>
              <label className={labelClassName}>
                Pay period start
                <input
                  className={fieldClassName}
                  name="payPeriodStart"
                  required
                  type="date"
                />
              </label>
              <label className={labelClassName}>
                Pay period end
                <input
                  className={fieldClassName}
                  name="payPeriodEnd"
                  required
                  type="date"
                />
              </label>
              <label className={labelClassName}>
                Authorized by
                <input className={fieldClassName} name="authorizedBy" required />
              </label>
              <label className={`${labelClassName} md:col-span-2`}>
                Reason
                <input className={fieldClassName} name="reason" required />
              </label>
              <div className="md:col-span-2">
                <button
                  className={buttonClassName}
                  disabled={processPending}
                  type="submit"
                >
                  {processPending ? "Processing…" : "Process encashment"}
                </button>
                {processState.message ? (
                  <p
                    className={`mt-2 text-sm ${processState.ok ? "text-green-600" : "text-destructive"}`}
                  >
                    {processState.message}
                  </p>
                ) : null}
              </div>
            </form>
          </section>
        </>
      ) : null}
    </div>
  );
};
