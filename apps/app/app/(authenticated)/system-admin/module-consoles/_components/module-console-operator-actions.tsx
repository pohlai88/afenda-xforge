"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactElement } from "react";

type ModuleConsoleOperatorActionsProps = {
  canAssign: boolean;
  consoleId: string;
  defaultCompanyId?: string;
};

export const ModuleConsoleOperatorActions = ({
  canAssign,
  consoleId,
  defaultCompanyId = "",
}: ModuleConsoleOperatorActionsProps): ReactElement => {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [operatorUserId, setOperatorUserId] = useState("");
  const [reason, setReason] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submitAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/system-admin/module-consoles/operators", {
        body: JSON.stringify({
          companyId,
          consoleId,
          operatorUserId,
          reason,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Operator assignment failed");
        return;
      }

      setMessage(`Assigned operator ${payload.id ?? operatorUserId}`);
      setOperatorUserId("");
      setReason("");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Operator assignment failed"
      );
    } finally {
      setPending(false);
    }
  };

  const submitRevoke = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/system-admin/module-consoles/operators/revoke",
        {
          body: JSON.stringify({
            assignmentId,
            reason,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        }
      );
      const payload = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Operator revoke failed");
        return;
      }

      setMessage(`Revoked assignment ${payload.id ?? assignmentId}`);
      setAssignmentId("");
      setReason("");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Operator revoke failed"
      );
    } finally {
      setPending(false);
    }
  };

  if (!canAssign) {
    return (
      <p className="text-muted-foreground text-sm">
        Requires system-admin.module-consoles.assign to manage operators.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <form className="space-y-3" onSubmit={submitAssign}>
        <h3 className="font-medium text-sm">Assign operator</h3>
        <input
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(event) => setCompanyId(event.target.value)}
          placeholder="Company ID"
          required
          value={companyId}
        />
        <input
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(event) => setOperatorUserId(event.target.value)}
          placeholder="Operator user ID"
          required
          value={operatorUserId}
        />
        <input
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason"
          required
          value={reason}
        />
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          Assign operator
        </button>
      </form>

      <form className="space-y-3" onSubmit={submitRevoke}>
        <h3 className="font-medium text-sm">Revoke assignment</h3>
        <input
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(event) => setAssignmentId(event.target.value)}
          placeholder="Assignment ID"
          required
          value={assignmentId}
        />
        <input
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason"
          required
          value={reason}
        />
        <button
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          Revoke assignment
        </button>
      </form>

      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
    </div>
  );
};
