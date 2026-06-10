import type { ReactElement } from "react";
import { renderMetadataAction, renderMetadataField } from "../adapters";
import type { MetadataRenderAdapterResult } from "../adapters/adapter-result";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../visualization/density-visual-contract";
import { renderMetadataStateBoundaryResult } from "./metadata-state-boundary";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

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

export type MetadataFormRenderResult =
  MetadataRenderAdapterResult<ReactElement>;

export function renderMetadataFormResult({
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
}: MetadataFormProps): MetadataFormRenderResult {
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "create",
    state,
  });
  const densityVisual = resolveDensityVisualDefinition(resolvedContext.density);

  if (state !== "ready") {
    const stateResult = renderMetadataStateBoundaryResult({
      context: resolvedContext,
      emptyDescription,
      emptyTitle,
      error,
      forbiddenDescription,
      forbiddenTitle,
      loadingDescription,
      loadingTitle,
      state,
    });

    return {
      diagnostics: stateResult.diagnostics,
      element: stateResult.element as ReactElement,
    };
  }

  const fieldResults = fields.map((field) =>
    renderMetadataField({
      context: resolvedContext,
      disabled,
      field,
      value: values?.[field.key],
    })
  );
  const actionResults =
    actions?.map((action) =>
      renderMetadataAction({
        action,
        context: resolvedContext,
        onAction,
      })
    ) ?? [];

  return {
    diagnostics: [...fieldResults, ...actionResults].flatMap(
      (result) => result.diagnostics
    ),
    element: (
      <form
        className={densityVisual.formSpacing}
        {...resolveDensitySurfaceProps(resolvedContext.density)}
      >
        {title || description ? (
          <header className={densityVisual.sectionSpacing}>
            {title ? (
              <h2 className={densityVisual.formTitleClass}>{title}</h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-muted-foreground text-sm leading-6">
                {description}
              </p>
            ) : null}
          </header>
        ) : null}

        <div className={cn("grid md:grid-cols-2", densityVisual.formGridGap)}>
          {fieldResults.map((result, index) => (
            <div key={fields[index]?.key}>{result.element}</div>
          ))}
        </div>

        {actionResults.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {actionResults.map((result, index) => (
              <div key={actions?.[index]?.key}>{result.element}</div>
            ))}
          </div>
        ) : null}
      </form>
    ),
  };
}

export function MetadataForm(props: MetadataFormProps): ReactElement {
  return renderMetadataFormResult(props).element;
}
