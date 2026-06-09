import type { ReactElement } from "react";
import { renderMetadataAction, renderMetadataField } from "../adapters";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import { MetadataStateBoundary } from "./metadata-state-boundary";

export type MetadataFormProps = {
  actions?: readonly MetadataActionContract[];
  context?: Partial<MetadataRenderContext>;
  description?: string;
  disabled?: boolean;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string;
  fields: readonly MetadataFieldContract[];
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  loadingDescription?: string;
  loadingTitle?: string;
  onAction?: (action: MetadataActionContract) => void;
  state?: MetadataRenderContext["state"];
  title?: string;
  values?: Record<string, unknown>;
};

export function MetadataForm({
  actions,
  context,
  description,
  disabled = false,
  emptyDescription,
  emptyTitle,
  error,
  fields,
  forbiddenDescription,
  forbiddenTitle,
  loadingDescription,
  loadingTitle,
  onAction,
  state = "ready",
  title,
  values,
}: MetadataFormProps): ReactElement {
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "create",
    state,
  });

  if (state !== "ready") {
    return (
      <MetadataStateBoundary
        context={resolvedContext}
        emptyDescription={emptyDescription}
        emptyTitle={emptyTitle}
        error={error}
        forbiddenDescription={forbiddenDescription}
        forbiddenTitle={forbiddenTitle}
        loadingDescription={loadingDescription}
        loadingTitle={loadingTitle}
        state={state}
      />
    );
  }

  return (
    <form className="space-y-6">
      {title || description ? (
        <header className="space-y-2">
          {title ? <h3 className="font-semibold text-xl">{title}</h3> : null}
          {description ? (
            <p className="max-w-2xl text-muted-foreground text-sm leading-6">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            {
              renderMetadataField({
                context: resolvedContext,
                disabled,
                field,
                value: values?.[field.key],
              }).element
            }
          </div>
        ))}
      </div>

      {actions && actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <div key={action.key}>
              {
                renderMetadataAction({
                  action,
                  context: resolvedContext,
                  onAction,
                }).element
              }
            </div>
          ))}
        </div>
      ) : null}
    </form>
  );
}
