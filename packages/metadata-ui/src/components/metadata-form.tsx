import { Button } from "@repo/ui/components/button";
import type { ReactElement } from "react";
import { renderMetadataAction, renderMetadataField } from "../adapters";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
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

const createContext = (
  context: Partial<MetadataRenderContext> | undefined,
  state: MetadataRenderContext["state"]
): MetadataRenderContext => ({
  density: context?.density ?? "default",
  mode: context?.mode ?? "create",
  permissions: context?.permissions ?? {},
  state,
});

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
  const resolvedContext = createContext(context, state);

  if (state !== "ready") {
    return (
      <MetadataStateBoundary
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
            {renderMetadataField({
              context: resolvedContext,
              disabled,
              field,
              value: values?.[field.key],
            })}
          </div>
        ))}
      </div>

      {actions && actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <div key={action.key}>
              {renderMetadataAction({
                action,
                context: resolvedContext,
                onAction,
              })}
            </div>
          ))}
          {actions.some((action) => action.kind === "button") ? null : (
            <Button size="sm" type="button" variant="default">
              Save
            </Button>
          )}
        </div>
      ) : null}
    </form>
  );
}
