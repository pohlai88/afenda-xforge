"use client";

import { useActionState } from "react";
import type { EmployeeAccessActionState } from "../_employee-access-actions.ts";
import {
  bindEmployeeUserAccountAction,
  deactivateEmployeeUserAccountAction,
} from "../_employee-access-actions.ts";

const initialState: EmployeeAccessActionState = {
  ok: false,
  message: "",
};

const fieldClassName =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const labelClassName = "block font-medium text-sm";
const buttonClassName =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:opacity-50";

type EmployeeAccessLinkRow = {
  active: boolean;
  employeeId: string;
  id: string;
  userId: string;
};

type EmployeeAccessPanelProps = {
  canWrite: boolean;
  links: readonly EmployeeAccessLinkRow[];
};

export const EmployeeAccessPanel = ({
  canWrite,
  links,
}: EmployeeAccessPanelProps) => {
  const [bindState, bindAction, bindPending] = useActionState(
    bindEmployeeUserAccountAction,
    initialState
  );

  return (
    <section className="space-y-8">
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-xl tracking-tight">
          Auth user ↔ employee links
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Bind platform auth users to employee records so LAM self-service can
          resolve <code className="font-mono">scopedEmployeeId</code> from the
          registry instead of user metadata.
        </p>
        {links.length === 0 ? (
          <p className="mt-4 text-muted-foreground text-sm">
            No employee access links configured for this company.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Auth user</th>
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Active</th>
                  {canWrite ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr className="border-border/60 border-b" key={link.id}>
                    <td className="py-2 pr-4 font-mono">{link.userId}</td>
                    <td className="py-2 pr-4 font-mono">{link.employeeId}</td>
                    <td className="py-2 pr-4">{link.active ? "Yes" : "No"}</td>
                    {canWrite ? (
                      <td className="py-2">
                        {link.active ? (
                          <form
                            action={deactivateEmployeeUserAccountAction}
                            className="inline"
                          >
                            <input name="userId" type="hidden" value={link.userId} />
                            <button
                              className="rounded-md border border-border px-2 py-1 text-xs transition hover:bg-muted"
                              title="Soft deactivate (link retained; LAM falls back to metadata if set)"
                              type="submit"
                            >
                              Deactivate
                            </button>
                          </form>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Inactive
                          </span>
                        )}
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
          <form action={bindAction} className="grid gap-4 md:grid-cols-2">
            <h3 className="font-medium md:col-span-2">Bind auth user to employee</h3>
            <label className={labelClassName}>
              Auth user id
              <input
                className={fieldClassName}
                name="userId"
                placeholder="Supabase auth user id"
                required
              />
            </label>
            <label className={labelClassName}>
              Employee id
              <input
                className={fieldClassName}
                name="employeeId"
                placeholder="Employee record id"
                required
              />
            </label>
            <div className="md:col-span-2">
              <button
                className={buttonClassName}
                disabled={bindPending}
                type="submit"
              >
                {bindPending ? "Saving…" : "Save link"}
              </button>
              {bindState.message ? (
                <p
                  className={`mt-2 text-sm ${bindState.ok ? "text-green-600" : "text-destructive"}`}
                >
                  {bindState.message}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}
    </section>
  );
};
