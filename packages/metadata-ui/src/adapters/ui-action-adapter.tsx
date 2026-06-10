import type { ReactElement } from "react";

import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { MetadataGovernanceEvaluation } from "../policy/governance.ts";
import { evaluateMetadataGovernance } from "../policy/governance.ts";
import { defaultActionRegistry } from "../registry/default-action-registry";
import { ErrorState } from "../renderers/states/error-state.renderer";
import { ForbiddenState } from "../renderers/states/forbidden-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { validateMetadataActionContract } from "./contract-validation";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import {
  bindRendererDiagnosticCorrelation,
  mergeRendererDiagnostics,
} from "./diagnostics";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataActionRenderer,
} from "./metadata-renderer-resolvers.tsx";
import { emitMetadataTelemetry } from "./telemetry.ts";

export type MetadataActionAdapterProps = {
  action: MetadataActionContract;
  context: MetadataRenderContext;
  onAction?: (action: MetadataActionContract) => void;
  registry?: typeof defaultActionRegistry;
};

function createGovernedActionContext(
  context: MetadataRenderContext,
  action: MetadataActionContract,
  readonly = false
): MetadataRenderContext {
  return {
    ...context,
    featureId: action.featureId ?? context.featureId,
    moduleId: action.moduleId ?? context.moduleId,
    readonly: context.readonly || readonly,
  };
}

function createActionDiagnostics(
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

function createActionRenderError(
  action: MetadataActionContract,
  diagnostics: readonly MetadataRendererDiagnostic[],
  error: unknown,
  correlationId: string
): MetadataRenderAdapterResult<ReactElement> {
  const rendererDiagnostic = createMetadataRendererErrorDiagnostic(
    "action",
    action.key,
    error,
    correlationId
  );

  return {
    diagnostics: mergeRendererDiagnostics(diagnostics, [rendererDiagnostic]),
    element: (
      <ErrorState
        description={rendererDiagnostic.message}
        title={`Failed to render action: ${action.label}`}
      />
    ),
  };
}

function renderDeniedAction(
  action: MetadataActionContract,
  context: MetadataRenderContext,
  diagnostics: readonly MetadataRendererDiagnostic[],
  governance: MetadataGovernanceEvaluation,
  renderResolvedAction: (
    nextAction: MetadataActionContract,
    nextContext: MetadataRenderContext
  ) => ReactElement | null
): MetadataRenderAdapterResult<ReactElement | null> {
  emitMetadataTelemetry(context, "metadata.renderer.fallback", {
    action: action.actionId ?? action.key,
    attributes: {
      actionKey: action.key,
      effect: governance.decision.effect,
      reason: governance.diagnostic?.code ?? "missing-permission",
    },
    diagnostics,
    governanceDecision: governance.decision,
    level: "warning",
    rendererKey: action.surface ?? action.kind,
  });

  if (governance.decision.effect === "hide") {
    return {
      diagnostics,
      element: null,
    };
  }

  if (
    governance.decision.effect === "disable" ||
    governance.decision.effect === "readonly"
  ) {
    try {
      return {
        diagnostics,
        element: renderResolvedAction(
          { ...action, disabled: true },
          createGovernedActionContext(
            context,
            action,
            governance.decision.effect === "readonly"
          )
        ),
      };
    } catch (error) {
      return createActionRenderError(
        action,
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
        title={`Action unavailable: ${action.label}`}
      />
    ),
  };
}

export function renderMetadataAction({
  action,
  context,
  onAction,
  registry = defaultActionRegistry,
}: MetadataActionAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const contractValidation = validateMetadataActionContract(action);

  if (!contractValidation.valid && contractValidation.diagnostic) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      contractValidation.diagnostic,
      context.correlationId
    ) as MetadataRendererDiagnostic;

    emitMetadataTelemetry(context, "metadata.renderer.fallback", {
      action: action?.key ?? "unknown",
      attributes: {
        actionKey: contractValidation.diagnostic.target ?? "unknown",
        reason: diagnostic.code,
      },
      diagnostics: [diagnostic],
      level: "error",
      rendererKey: action?.surface ?? action?.kind ?? "button",
    });

    return {
      diagnostics: [diagnostic],
      element: (
        <ErrorState
          context={context}
          correlationId={context.correlationId}
          description={diagnostic.message}
          title="Invalid action contract"
        />
      ),
    };
  }

  const resolution = resolveMetadataActionRenderer(action, registry);
  const governance = evaluateMetadataGovernance({
    context,
    disabled: action.disabled,
    key: action.key,
    policy: action,
    readonly: context.readonly,
    target: "action",
  });
  const diagnostics = createActionDiagnostics(
    context,
    resolution.diagnostic,
    governance.diagnostic
  );

  emitMetadataTelemetry(context, "metadata.action.render.started", {
    action: action.actionId ?? action.key,
    attributes: {
      actionKey: action.key,
      actionSurface: action.surface ?? action.kind ?? "button",
      disabled: governance.disabled,
      readonly: context.readonly,
    },
    diagnostics,
    governanceDecision: governance.decision,
    level: "debug",
    rendererKey: action.surface ?? action.kind,
  });

  const renderResolvedAction = (
    nextAction: MetadataActionContract,
    nextContext: MetadataRenderContext
  ): ReactElement | null =>
    resolution.renderer({
      action: nextAction,
      context: nextContext,
      diagnostics,
      onAction: (nextResolvedAction: MetadataActionContract): void => {
        emitMetadataTelemetry(context, "metadata.action.clicked", {
          action: nextResolvedAction.actionId ?? nextResolvedAction.key,
          attributes: {
            actionKey: nextResolvedAction.key,
            actionSurface:
              nextResolvedAction.surface ?? nextResolvedAction.kind ?? "button",
            disabled: nextResolvedAction.disabled ?? false,
          },
          diagnostics,
          governanceDecision: governance.decision,
          level: "info",
          rendererKey: nextResolvedAction.surface ?? nextResolvedAction.kind,
        });
        onAction?.(nextResolvedAction);
      },
    });

  if (!governance.allowed) {
    return renderDeniedAction(
      action,
      context,
      diagnostics,
      governance,
      renderResolvedAction
    );
  }

  try {
    const element = renderResolvedAction(
      governance.disabled ? { ...action, disabled: true } : action,
      createGovernedActionContext(context, action)
    );

    emitMetadataTelemetry(context, "metadata.action.render.completed", {
      action: action.actionId ?? action.key,
      attributes: {
        actionKey: action.key,
        actionSurface: action.surface ?? action.kind ?? "button",
        disabled: governance.disabled,
        readonly: context.readonly,
      },
      diagnostics,
      governanceDecision: governance.decision,
      level: "info",
      rendererKey: action.surface ?? action.kind,
    });

    return { diagnostics, element };
  } catch (error) {
    const result = createActionRenderError(
      action,
      diagnostics,
      error,
      context.correlationId
    );

    emitMetadataTelemetry(context, "metadata.action.render.error", {
      action: action.actionId ?? action.key,
      attributes: {
        actionKey: action.key,
        message: result.diagnostics.at(-1)?.message ?? "render failed",
      },
      diagnostics: result.diagnostics,
      level: "error",
      rendererKey: action.surface ?? action.kind,
    });

    return result;
  }
}
