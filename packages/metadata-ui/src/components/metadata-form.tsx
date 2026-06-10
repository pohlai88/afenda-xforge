import type { ReactElement } from "react";
import { renderMetadataAction, renderMetadataField } from "../adapters";
import type { MetadataRenderAdapterResult } from "../adapters/adapter-result";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import {
  METADATA_FORM_DESCRIPTION_CLASS,
  METADATA_FORM_TITLE_CLASS,
} from "../visualization/content-length-visual-contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../visualization/density-visual-contract";
import {
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../visualization/surface-visual-contract";
import { composeMetadataWithDiagnostics } from "./compose-metadata-with-diagnostics";
import { renderMetadataStateBoundaryResult } from "./metadata-state-boundary";
import { MetadataSurfaceRegion } from "./metadata-surface-region";

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
      element: composeMetadataWithDiagnostics(
        resolvedContext,
        stateResult.element as ReactElement,
        stateResult.diagnostics
      ),
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

  const diagnostics = [...fieldResults, ...actionResults].flatMap(
    (result) => result.diagnostics
  );

  return {
    diagnostics,
    element: composeMetadataWithDiagnostics(
      resolvedContext,
      <form
        className={cn(
          densityVisual.formSpacing,
          resolveSurfaceShellClassName("form")
        )}
        {...resolveDensitySurfaceProps(resolvedContext.density)}
        {...resolveSurfaceKindProps("form")}
      >
        {title || description ? (
          <header className={densityVisual.sectionSpacing}>
            {title ? (
              <MetadataSurfaceRegion kind="form" region="title">
                <h2
                  className={cn(
                    densityVisual.formTitleClass,
                    METADATA_FORM_TITLE_CLASS
                  )}
                  title={title}
                >
                  {title}
                </h2>
              </MetadataSurfaceRegion>
            ) : null}
            {description ? (
              <MetadataSurfaceRegion kind="form" region="description">
                <p
                  className={cn(
                    "max-w-2xl text-muted-foreground text-sm leading-6",
                    METADATA_FORM_DESCRIPTION_CLASS
                  )}
                  title={description}
                >
                  {description}
                </p>
              </MetadataSurfaceRegion>
            ) : null}
          </header>
        ) : null}

        <MetadataSurfaceRegion kind="form" region="primary">
          <MetadataSurfaceRegion kind="form" region="field-groups">
            <div
              className={cn("grid md:grid-cols-2", densityVisual.formGridGap)}
            >
              {fieldResults.map((result, index) => (
                <div key={fields[index]?.key}>{result.element}</div>
              ))}
            </div>
          </MetadataSurfaceRegion>
        </MetadataSurfaceRegion>

        {actionResults.length > 0 ? (
          <MetadataSurfaceRegion kind="form" region="secondary-actions">
            <div className="flex flex-wrap items-center gap-2">
              {actionResults.map((result, index) => (
                <div key={actions?.[index]?.key}>{result.element}</div>
              ))}
            </div>
          </MetadataSurfaceRegion>
        ) : null}
      </form>,
      diagnostics
    ),
  };
}

export function MetadataForm(props: MetadataFormProps): ReactElement {
  return renderMetadataFormResult(props).element;
}
