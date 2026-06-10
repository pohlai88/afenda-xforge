import type { EntityMetadata } from "@repo/metadata";
import type { ReactElement } from "react";
import { renderMetadataAction, renderMetadataField } from "../adapters";
import type { MetadataRenderAdapterResult } from "../adapters/adapter-result";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import type { MetadataCustomizationInput } from "../customization";
import { resolveMetadataEntityCustomization } from "../customization";
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

export type MetadataFormProps = MetadataCustomizationInput & {
  actions?: readonly MetadataActionContract[];
  context?: Partial<MetadataRenderContext>;
  description?: string;
  disabled?: boolean;
  emptyDescription?: string;
  emptyTitle?: string;
  entityMetadata?: EntityMetadata;
  error?: string;
  fields?: readonly MetadataFieldContract[];
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  loadingDescription?: string;
  loadingTitle?: string;
  onAction?: (action: MetadataActionContract) => void;
  onFieldChange?: (fieldKey: string, value: unknown) => void;
  state?: MetadataRenderContext["state"];
  title?: string;
  values?: Record<string, unknown>;
};

export type MetadataFormRenderResult =
  MetadataRenderAdapterResult<ReactElement>;

export function renderMetadataFormResult({
  actions,
  context,
  customization,
  customizationLayers,
  customizationOptions,
  description,
  disabled = false,
  emptyDescription,
  emptyTitle,
  entityMetadata,
  error,
  fields = [],
  forbiddenDescription,
  forbiddenTitle,
  loadingDescription,
  loadingTitle,
  onAction,
  onFieldChange,
  state = "ready",
  title,
  values,
}: MetadataFormProps): MetadataFormRenderResult {
  const resolvedEntityMetadata = entityMetadata
    ? resolveMetadataEntityCustomization(entityMetadata, {
        customization,
        customizationLayers,
        customizationOptions,
      })
    : undefined;
  const resolvedFields = (
    fields.length > 0 ? fields : (resolvedEntityMetadata?.fields ?? [])
  ) as readonly MetadataFieldContract[];
  const resolvedActions =
    actions ?? resolvedEntityMetadata?.actions ?? undefined;
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

  const fieldResults = resolvedFields.map((field) =>
    renderMetadataField({
      context: resolvedContext,
      disabled,
      field,
      onChange: onFieldChange
        ? (nextValue): void => {
            onFieldChange(field.key, nextValue);
          }
        : undefined,
      value: values?.[field.key],
    })
  );
  const actionResults =
    resolvedActions?.map((action) =>
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
                <div key={resolvedFields[index]?.key}>{result.element}</div>
              ))}
            </div>
          </MetadataSurfaceRegion>
        </MetadataSurfaceRegion>

        {actionResults.length > 0 ? (
          <MetadataSurfaceRegion kind="form" region="secondary-actions">
            <div className="flex flex-wrap items-center gap-2">
              {actionResults.map((result, index) => (
                <div key={resolvedActions?.[index]?.key}>{result.element}</div>
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
