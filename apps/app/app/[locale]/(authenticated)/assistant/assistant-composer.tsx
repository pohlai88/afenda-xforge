"use client";

import { xforgeAiModules } from "@repo/machine/client";
import type {
  MachineAssistantResponse,
  XforgeChatMessage,
} from "@repo/machine/contract";
import { machineAssistantResponseSchema } from "@repo/machine/contract";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useState } from "react";
import { withCSRFHeader } from "../../../../lib/csrf.client.ts";

type ModuleSelection = "auto" | (typeof xforgeAiModules)[number];

type ConversationEntry = XforgeChatMessage & {
  id: string;
};

type AssistantEnvelope = {
  data?: unknown;
  error?: {
    message?: string;
  };
  success?: boolean;
};

const moduleOptions: readonly ModuleSelection[] = ["auto", ...xforgeAiModules];

const toMessageError = (value: unknown): string =>
  value instanceof Error ? value.message : "The assistant request failed.";

export function AssistantComposer(): ReactElement {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [module, setModule] = useState<ModuleSelection>("auto");
  const [lastResult, setLastResult] = useState<MachineAssistantResponse | null>(
    null
  );
  let statusMessage: ReactElement;

  if (error) {
    statusMessage = <p className="text-destructive text-sm">{error}</p>;
  } else if (lastResult) {
    statusMessage = (
      <p className="text-muted-foreground text-sm">
        {lastResult.assistant} answered with {lastResult.module} context at{" "}
        {Math.round(lastResult.intentConfidence * 100)}% intent confidence.
      </p>
    );
  } else {
    statusMessage = (
      <p className="text-muted-foreground text-sm">
        The assistant stays tenant-scoped and permission-checked.
      </p>
    );
  }

  const submitMessage = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const message = draft.trim();

    if (!message) {
      setError("Enter a message before asking the assistant.");
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/internal/v1/ai/queries/assistant", {
        body: JSON.stringify({
          history: history.map(({ content, role }) => ({
            content,
            role,
          })),
          message,
          ...(module === "auto" ? {} : { module }),
        }),
        headers: withCSRFHeader({
          "content-type": "application/json",
        }),
        method: "POST",
      });

      const payload = (await response.json()) as AssistantEnvelope;

      if (!(response.ok && payload.success === true)) {
        throw new Error(
          payload.error?.message ??
            `Assistant request failed (${response.status})`
        );
      }

      const result = machineAssistantResponseSchema.parse(payload.data);

      setHistory((current) => [
        ...current,
        {
          content: message,
          id: crypto.randomUUID(),
          role: "user",
        },
        {
          content: result.response,
          id: crypto.randomUUID(),
          role: "assistant",
        },
      ]);
      setLastResult(result);
      setDraft("");
    } catch (assistantError) {
      setError(toMessageError(assistantError));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card/95 p-6 shadow-sm">
      <form className="space-y-4" onSubmit={submitMessage}>
        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
          <label className="space-y-2">
            <span className="block font-medium text-sm">Module</span>
            <select
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setModule(event.target.value as ModuleSelection)
              }
              value={module}
            >
              {moduleOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "auto"
                    ? "Auto"
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Message</span>
            <textarea
              className="min-h-[10rem] w-full rounded-md border border-border bg-background px-4 py-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setDraft(event.target.value)
              }
              placeholder="Ask for tenant context, master-data guidance, or a summary of what the workspace can see."
              value={draft}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Thinking..." : "Ask assistant"}
          </button>

          {statusMessage}
        </div>
      </form>

      <div className="space-y-4 border-border border-t pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-lg tracking-tight">Conversation</h2>
          <p className="text-muted-foreground text-sm">
            {history.length} message{history.length === 1 ? "" : "s"}
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-lg border border-border/70 border-dashed bg-background/80 p-6 text-muted-foreground text-sm">
            No assistant messages yet. Ask a question to start a tenant-scoped
            conversation.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                className={`flex ${
                  entry.role === "user" ? "justify-end" : "justify-start"
                }`}
                key={entry.id}
              >
                <article
                  className={`max-w-3xl rounded-lg border p-4 shadow-sm ${
                    entry.role === "user"
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-background/80"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-medium text-sm capitalize">
                      {entry.role}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-foreground text-sm leading-6">
                    {entry.content}
                  </p>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
