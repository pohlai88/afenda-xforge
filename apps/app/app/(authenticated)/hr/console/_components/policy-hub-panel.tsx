"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatDateInputValue } from "../_lam-form-utils.ts";
import type { LamConfigActionState } from "../_lam-config-actions.ts";
import {
  toggleAttendancePolicyActiveAction,
  upsertAttendancePolicyAction,
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

type PolicyRow = {
  absenceThresholdMinutes: number;
  active: boolean;
  code: string;
  earlyDepartureThresholdMinutes: number;
  effectiveFrom: Date | string;
  gracePeriodMinutes: number;
  id: string;
  latenessThresholdMinutes: number;
  title: string;
};

type PolicyHubPanelProps = {
  canWrite: boolean;
  editPolicyId?: string;
  policies: readonly PolicyRow[];
};

export const PolicyHubPanel = ({
  canWrite,
  editPolicyId,
  policies,
}: PolicyHubPanelProps) => {
  const editingPolicy =
    policies.find((policy) => policy.id === editPolicyId) ?? null;
  const [state, action, pending] = useActionState(
    upsertAttendancePolicyAction,
    initialState
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">
          Attendance policies
        </h2>
        {policies.length === 0 ? (
          <p className="mt-3 text-muted-foreground text-sm">
            No attendance policies configured yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Grace (min)</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr className="border-border/60 border-b" key={policy.id}>
                    <td className="py-2 pr-4 font-mono">{policy.code}</td>
                    <td className="py-2 pr-4">{policy.title}</td>
                    <td className="py-2 pr-4">{policy.gracePeriodMinutes}</td>
                    <td className="py-2 pr-4">{policy.active ? "Yes" : "No"}</td>
                    {canWrite ? (
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Link
                            className="text-primary text-xs underline"
                            href={`/hr/console/policy?editPolicy=${policy.id}`}
                          >
                            Edit
                          </Link>
                          <LamRowToggleForm
                            action={toggleAttendancePolicyActiveAction}
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
        <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
          <h2 className="font-semibold text-xl tracking-tight">
            {editingPolicy
              ? "Edit attendance policy"
              : "Create attendance policy"}
          </h2>
          <form action={action} className="mt-4 grid gap-4 md:grid-cols-2">
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
              Grace period (minutes)
              <input
                className={fieldClassName}
                defaultValue={editingPolicy?.gracePeriodMinutes ?? 5}
                min={0}
                name="gracePeriodMinutes"
                required
                type="number"
              />
            </label>
            <label className={labelClassName}>
              Lateness threshold (minutes)
              <input
                className={fieldClassName}
                defaultValue={editingPolicy?.latenessThresholdMinutes ?? 15}
                min={0}
                name="latenessThresholdMinutes"
                required
                type="number"
              />
            </label>
            <label className={labelClassName}>
              Early departure threshold (minutes)
              <input
                className={fieldClassName}
                defaultValue={
                  editingPolicy?.earlyDepartureThresholdMinutes ?? 15
                }
                min={0}
                name="earlyDepartureThresholdMinutes"
                required
                type="number"
              />
            </label>
            <label className={labelClassName}>
              Absence threshold (minutes)
              <input
                className={fieldClassName}
                defaultValue={editingPolicy?.absenceThresholdMinutes ?? 240}
                min={0}
                name="absenceThresholdMinutes"
                required
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
                disabled={pending}
                type="submit"
              >
                {pending ? "Saving…" : "Save attendance policy"}
              </button>
              {state.message ? (
                <p
                  className={`mt-2 text-sm ${state.ok ? "text-green-600" : "text-destructive"}`}
                >
                  {state.message}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
};
