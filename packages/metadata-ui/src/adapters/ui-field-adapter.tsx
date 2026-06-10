import type { ReactElement } from "react";

import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { MetadataGovernanceEvaluation } from "../policy/governance.ts";
import { evaluateMetadataGovernance } from "../policy/governance.ts";
import { defaultFieldRegistry } from "../registry/default-field-registry";
import { ErrorState } from "../renderers/states/error-state.renderer";
import { ForbiddenState } from "../renderers/states/forbidden-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { validateMetadataFieldContract } from "./contract-validation";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import {
  bindRendererDiagnosticCorrelation,
  mergeRendererDiagnostics,
} from "./diagnostics";
import { createInvalidContractFallbackResult } from "./invalid-contract-fallback";
import { withLocalizedFieldLabel } from "./localized-metadata-contracts";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataFieldRenderer,
} from "./metadata-renderer-resolvers.tsx";
import { emitMetadataTelemetry } from "./telemetry.ts";

export type MetadataFieldAdapterProps = {
  context: MetadataRenderContext;
  disabled?: boolean;
  field: MetadataFieldContract;
  onChange?: (value: unknown) => void;
  registry?: typeof defaultFieldRegistry;
  value?: unknown;
};

function createGovernedFieldContext(
  context: MetadataRenderContext,
  field: MetadataFieldContract,
  readonly = false
): MetadataRenderContext {
  return {
    ...context,
    featureId: field.featureId ?? context.featureId,
    moduleId: field.moduleId ?? context.moduleId,
    readonly: context.readonly || readonly,
  };
}

function createFieldDiagnostics(
  context: MetadataRenderContext,
  resolutionDiagnostic: MetadataRendererDiagnostic | undefined,
  governanceDiagnostic: MetadataRendererDiagnostic | undefined
): readonly MetadataRendererDiagnostic[] {
  const resolvedDiagnostic = bindRendererDiagnosticCorrelation(
    resolutionDiagnostic,
    context.correlationId
  );
  const resolvedGovernanceDiagnostic = bindRendererDiagnosticCorrelation(
    governanceDiagnostic,
    context.correlationId
  );

  return mergeRendererDiagnostics(
    resolvedDiagnostic ? [resolvedDiagnostic] : [],
    resolvedGovernanceDiagnostic ? [resolvedGovernanceDiagnostic] : []
  );
}

function createFieldRenderError(
  field: MetadataFieldContract,
  diagnostics: readonly MetadataRendererDiagnostic[],
  error: unknown,
  correlationId: string
): MetadataRenderAdapterResult<ReactElement> {
  const rendererDiagnostic = createMetadataRendererErrorDiagnostic(
    "field",
    field.key,
    error,
    correlationId
  );

  return {
    diagnostics: mergeRendererDiagnostics(diagnostics, [rendererDiagnostic]),
    element: (
      <ErrorState
        description={rendererDiagnostic.message}
        title={`Failed to render field: ${field.label}`}
      />
    ),
  };
}

function renderDeniedField(
  context: MetadataRenderContext,
  field: MetadataFieldContract,
  diagnostics: readonly MetadataRendererDiagnostic[],
  governance: MetadataGovernanceEvaluation,
  renderResolvedField: (
    nextContext: MetadataRenderContext,
    disabled: boolean
  ) => ReactElement | null
): MetadataRenderAdapterResult<ReactElement | null> {
  const reason =
    field.visible === false
      ? "hidden-field"
      : (governance.diagnostic?.code ?? "governance-hidden");

  emitMetadataTelemetry(context, "metadata.renderer.fallback", {
    attributes: {
      effect: field.visible === false ? "hide" : governance.decision.effect,
      fieldKey: field.key,
      reason,
    },
    diagnostics,
    governanceDecision: governance.decision,
    level: "warning",
    rendererKey: field.kind ?? "text",
  });

  if (field.visible === false || governance.decision.effect === "hide") {
    return {
      diagnostics,
      element: null,
    };
  }

  if (
    governance.decision.effect === "disable" ||
    governance.decision.effect === "readonly"
  ) {
    const isReadonlyEffect = governance.decision.effect === "readonly";

    try {
      return {
        diagnostics,
        element: renderResolvedField(
          createGovernedFieldContext(context, field, isReadonlyEffect),
          !isReadonlyEffect
        ),
      };
    } catch (error) {
      return createFieldRenderError(
        field,
        diagnostics,
        error,
        context.correlationId
      );
    }
  }

  return {
    diagnostics,
    element: (
      <ForbiddenState
        description={governance.diagnostic?.message}
        title={`Field unavailable: ${field.label}`}
      />
    ),
  };
}

export function renderMetadataField({
  context,
  disabled,
  field,
  onChange,
  registry = defaultFieldRegistry,
  value,
}: MetadataFieldAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const contractValidation = validateMetadataFieldContract(field);

  if (!contractValidation.valid && contractValidation.diagnostic) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      contractValidation.diagnostic,
      context.correlationId
    ) as MetadataRendererDiagnostic;

    return createInvalidContractFallbackResult(
      context,
      diagnostic,
      "Invalid field contract",
      {
        attributes: {
          fieldKey: contractValidation.diagnostic.target ?? "unknown",
        },
        rendererKey: field?.kind ?? "text",
      }
    );
  }

  const resolution = resolveMetadataFieldRenderer(
    field.kind,
    registry,
    context
  );
  const governance = evaluateMetadataGovernance({
    context,
    disabled: disabled ?? field.disabled ?? field.readOnly,
    key: field.key,
    policy: field,
    readonly: context.readonly,
    target: "field",
  });
  const diagnostics = createFieldDiagnostics(
    context,
    resolution.diagnostic,
    governance.diagnostic
  );

  emitMetadataTelemetry(context, "metadata.field.render.started", {
    attributes: {
      disabled: governance.disabled,
      fieldKey: field.key,
      readonly: context.readonly,
      visible: field.visible !== false,
    },
    diagnostics,
    governanceDecision: governance.decision,
    level: "debug",
    rendererKey: field.kind ?? "text",
  });

  const localizedField = withLocalizedFieldLabel(field, context);

  const renderResolvedField = (
    nextContext: MetadataRenderContext,
    nextDisabled: boolean
  ): ReactElement | null =>
    resolution.renderer({
      context: nextContext,
      diagnostics,
      disabled: nextDisabled,
      field: withLocalizedFieldLabel(localizedField, nextContext),
      onChange,
      value,
    });

  if (
    field.visible === false ||
    !governance.allowed ||
    governance.decision.effect === "disable" ||
    governance.decision.effect === "readonly"
  ) {
    return renderDeniedField(
      context,
      field,
      diagnostics,
      governance,
      renderResolvedField
    );
  }

  try {
    const isReadOnly = context.readonly || field.readOnly === true;
    const element = renderResolvedField(
      createGovernedFieldContext(context, field, isReadOnly),
      !isReadOnly && (disabled === true || field.disabled === true)
    );

    emitMetadataTelemetry(context, "metadata.field.render.completed", {
      attributes: {
        disabled: governance.disabled,
        fieldKey: field.key,
        readonly: context.readonly,
      },
      diagnostics,
      governanceDecision: governance.decision,
      level: "info",
      rendererKey: field.kind ?? "text",
    });

    return { diagnostics, element };
  } catch (error) {
    const result = createFieldRenderError(
      field,
      diagnostics,
      error,
      context.correlationId
    );

    emitMetadataTelemetry(context, "metadata.field.render.error", {
      attributes: {
        fieldKey: field.key,
        message: result.diagnostics.at(-1)?.message ?? "render failed",
      },
      diagnostics: result.diagnostics,
      level: "error",
      rendererKey: field.kind ?? "text",
    });

    return result;
  }
}
