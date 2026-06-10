"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatDateInputValue } from "../_lam-form-utils.ts";
import type { LamConfigActionState } from "../_lam-config-actions.ts";
import {
  toggleHolidayCalendarActiveAction,
  toggleWorkCalendarActiveAction,
  upsertHolidayCalendarAction,
  upsertWorkCalendarAction,
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

type CalendarRow = {
  active: boolean;
  code: string;
  effectiveFrom: Date | string;
  id: string;
  title: string;
};

type CalendarHubPanelProps = {
  canWrite: boolean;
  editHolidayId?: string;
  editWorkCalendarId?: string;
  holidayCalendars: readonly CalendarRow[];
  workCalendars: readonly CalendarRow[];
};

const CalendarTable = ({
  calendars,
  canWrite,
  editHrefPrefix,
  title,
  toggleAction,
}: {
  calendars: readonly CalendarRow[];
  canWrite: boolean;
  editHrefPrefix: string;
  title: string;
  toggleAction: (formData: FormData) => Promise<void>;
}) => (
  <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
    <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
    {calendars.length === 0 ? (
      <p className="mt-3 text-muted-foreground text-sm">No records yet.</p>
    ) : (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-border border-b text-left text-muted-foreground">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Active</th>
              {canWrite ? <th className="py-2">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {calendars.map((calendar) => (
              <tr className="border-border/60 border-b" key={calendar.id}>
                <td className="py-2 pr-4 font-mono">{calendar.code}</td>
                <td className="py-2 pr-4">{calendar.title}</td>
                <td className="py-2 pr-4">{calendar.active ? "Yes" : "No"}</td>
                {canWrite ? (
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        className="text-primary text-xs underline"
                        href={`${editHrefPrefix}${calendar.id}`}
                      >
                        Edit
                      </Link>
                      <LamRowToggleForm
                        action={toggleAction}
                        active={calendar.active}
                        id={calendar.id}
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
);

export const CalendarHubPanel = ({
  canWrite,
  editHolidayId,
  editWorkCalendarId,
  holidayCalendars,
  workCalendars,
}: CalendarHubPanelProps) => {
  const editingWorkCalendar =
    workCalendars.find((entry) => entry.id === editWorkCalendarId) ?? null;
  const editingHolidayCalendar =
    holidayCalendars.find((entry) => entry.id === editHolidayId) ?? null;

  const [workState, workAction, workPending] = useActionState(
    upsertWorkCalendarAction,
    initialState
  );
  const [holidayState, holidayAction, holidayPending] = useActionState(
    upsertHolidayCalendarAction,
    initialState
  );

  return (
    <div className="space-y-8">
      <CalendarTable
        calendars={workCalendars}
        canWrite={canWrite}
        editHrefPrefix="/hr/console/calendars?editWork="
        title="Work calendars"
        toggleAction={toggleWorkCalendarActiveAction}
      />
      <CalendarTable
        calendars={holidayCalendars}
        canWrite={canWrite}
        editHrefPrefix="/hr/console/calendars?editHoliday="
        title="Holiday calendars"
        toggleAction={toggleHolidayCalendarActiveAction}
      />

      {canWrite ? (
        <>
          <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
            <h2 className="font-semibold text-xl tracking-tight">
              {editingWorkCalendar
                ? "Edit work calendar"
                : "Create work calendar"}
            </h2>
            <form action={workAction} className="mt-4 grid gap-4 md:grid-cols-2">
              {editingWorkCalendar ? (
                <input name="id" type="hidden" value={editingWorkCalendar.id} />
              ) : null}
              <label className={labelClassName}>
                Code
                <input
                  className={fieldClassName}
                  defaultValue={editingWorkCalendar?.code}
                  name="code"
                  required
                />
              </label>
              <label className={labelClassName}>
                Title
                <input
                  className={fieldClassName}
                  defaultValue={editingWorkCalendar?.title}
                  name="title"
                  required
                />
              </label>
              <label className={labelClassName}>
                Effective from
                <input
                  className={fieldClassName}
                  defaultValue={
                    editingWorkCalendar
                      ? formatDateInputValue(editingWorkCalendar.effectiveFrom)
                      : undefined
                  }
                  name="effectiveFrom"
                  required
                  type="date"
                />
              </label>
              <label className="flex items-center gap-2 self-end font-medium text-sm">
                <input
                  defaultChecked={editingWorkCalendar?.active ?? true}
                  name="active"
                  type="checkbox"
                />
                Active
              </label>
              <div className="md:col-span-2">
                <button
                  className={buttonClassName}
                  disabled={workPending}
                  type="submit"
                >
                  {workPending ? "Saving…" : "Save work calendar"}
                </button>
                {workState.message ? (
                  <p
                    className={`mt-2 text-sm ${workState.ok ? "text-green-600" : "text-destructive"}`}
                  >
                    {workState.message}
                  </p>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
            <h2 className="font-semibold text-xl tracking-tight">
              {editingHolidayCalendar
                ? "Edit holiday calendar"
                : "Create holiday calendar"}
            </h2>
            <form
              action={holidayAction}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              {editingHolidayCalendar ? (
                <input
                  name="id"
                  type="hidden"
                  value={editingHolidayCalendar.id}
                />
              ) : null}
              <label className={labelClassName}>
                Code
                <input
                  className={fieldClassName}
                  defaultValue={editingHolidayCalendar?.code}
                  name="code"
                  required
                />
              </label>
              <label className={labelClassName}>
                Title
                <input
                  className={fieldClassName}
                  defaultValue={editingHolidayCalendar?.title}
                  name="title"
                  required
                />
              </label>
              <label className={labelClassName}>
                Effective from
                <input
                  className={fieldClassName}
                  defaultValue={
                    editingHolidayCalendar
                      ? formatDateInputValue(
                          editingHolidayCalendar.effectiveFrom
                        )
                      : undefined
                  }
                  name="effectiveFrom"
                  required
                  type="date"
                />
              </label>
              <label className="flex items-center gap-2 self-end font-medium text-sm">
                <input
                  defaultChecked={editingHolidayCalendar?.active ?? true}
                  name="active"
                  type="checkbox"
                />
                Active
              </label>
              <div className="md:col-span-2">
                <button
                  className={buttonClassName}
                  disabled={holidayPending}
                  type="submit"
                >
                  {holidayPending ? "Saving…" : "Save holiday calendar"}
                </button>
                {holidayState.message ? (
                  <p
                    className={`mt-2 text-sm ${holidayState.ok ? "text-green-600" : "text-destructive"}`}
                  >
                    {holidayState.message}
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
