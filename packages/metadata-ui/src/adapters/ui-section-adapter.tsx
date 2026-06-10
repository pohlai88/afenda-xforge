import type { ReactElement, ReactNode } from "react";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { MetadataSectionContract } from "../contracts/section-renderer.contract";
import type { MetadataGovernanceEvaluation } from "../policy/governance.ts";
import { evaluateMetadataGovernance } from "../policy/governance.ts";
import { defaultSectionRegistry } from "../registry/default-section-registry";
import { ErrorState } from "../renderers/states/error-state.renderer";
import { ForbiddenState } from "../renderers/states/forbidden-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { validateMetadataSectionContract } from "./contract-validation";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import {
  bindRendererDiagnosticCorrelation,
  mergeRendererDiagnostics,
} from "./diagnostics";
import {
  createMetadataRendererErrorDiagnostic,
  resolveMetadataSectionRenderer,
} from "./metadata-renderer-resolvers.tsx";
import { emitMetadataTelemetry } from "./telemetry.ts";

export type MetadataSectionAdapterProps = {
  children?: ReactNode;
  context: MetadataRenderContext;
  registry?: typeof defaultSectionRegistry;
  section: MetadataSectionContract;
};

function createGovernedSectionContext(
  context: MetadataRenderContext,
  section: MetadataSectionContract,
  readonly = false
): MetadataRenderContext {
  return {
    ...context,
    featureId: section.featureId ?? context.featureId,
    moduleId: section.moduleId ?? context.moduleId,
    readonly: context.readonly || readonly,
  };
}

function createSectionDiagnostics(
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

function createSectionRenderError(
  section: MetadataSectionContract,
  diagnostics: readonly MetadataRendererDiagnostic[],
  error: unknown,
  correlationId: string
): MetadataRenderAdapterResult<ReactElement> {
  const rendererDiagnostic = createMetadataRendererErrorDiagnostic(
    "section",
    section.key,
    error,
    correlationId
  );

  return {
    diagnostics: mergeRendererDiagnostics(diagnostics, [rendererDiagnostic]),
    element: (
      <ErrorState
        description={rendererDiagnostic.message}
        title={`Failed to render section: ${section.title}`}
      />
    ),
  };
}

function renderDeniedSection(
  context: MetadataRenderContext,
  section: MetadataSectionContract,
  diagnostics: readonly MetadataRendererDiagnostic[],
  governance: MetadataGovernanceEvaluation,
  renderResolvedSection: (
    nextContext: MetadataRenderContext
  ) => ReactElement | null
): MetadataRenderAdapterResult<ReactElement | null> {
  const reason =
    section.visible === false
      ? "hidden-section"
      : (governance.diagnostic?.code ?? "governance-hidden");

  emitMetadataTelemetry(context, "metadata.renderer.fallback", {
    attributes: {
      effect: section.visible === false ? "hide" : governance.decision.effect,
      reason,
      sectionKey: section.key,
    },
    diagnostics,
    governanceDecision: governance.decision,
    level: "warning",
    rendererKey: section.kind ?? "section",
  });

  if (section.visible === false || governance.decision.effect === "hide") {
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
        element: renderResolvedSection(
          createGovernedSectionContext(
            context,
            section,
            governance.decision.effect === "readonly"
          )
        ),
      };
    } catch (error) {
      return createSectionRenderError(
        section,
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
        title={`Section unavailable: ${section.title}`}
      />
    ),
  };
}

export function renderMetadataSection({
  children,
  context,
  registry = defaultSectionRegistry,
  section,
}: MetadataSectionAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const contractValidation = validateMetadataSectionContract(section);

  if (!contractValidation.valid && contractValidation.diagnostic) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      contractValidation.diagnostic,
      context.correlationId
    ) as MetadataRendererDiagnostic;

    emitMetadataTelemetry(context, "metadata.renderer.fallback", {
      attributes: {
        reason: diagnostic.code,
        sectionKey: contractValidation.diagnostic.target ?? "unknown",
      },
      diagnostics: [diagnostic],
      level: "error",
      rendererKey: section?.kind ?? "section",
    });

    return {
      diagnostics: [diagnostic],
      element: (
        <ErrorState
          context={context}
          correlationId={context.correlationId}
          description={diagnostic.message}
          title="Invalid section contract"
        />
      ),
    };
  }

  const resolution = resolveMetadataSectionRenderer(section.kind, registry);
  const governance = evaluateMetadataGovernance({
    context,
    key: section.key,
    policy: section,
    readonly: context.readonly,
    target: "section",
  });
  const diagnostics = createSectionDiagnostics(
    context,
    resolution.diagnostic,
    governance.diagnostic
  );

  emitMetadataTelemetry(context, "metadata.section.render.started", {
    attributes: {
      sectionKey: section.key,
      sectionKind: section.kind ?? "section",
      visible: section.visible !== false,
    },
    diagnostics,
    governanceDecision: governance.decision,
    level: "debug",
    rendererKey: section.kind ?? "section",
  });

  const renderResolvedSection = (
    nextContext: MetadataRenderContext
  ): ReactElement | null =>
    resolution.renderer({
      children,
      context: nextContext,
      diagnostics,
      section,
    });

  if (!governance.allowed || section.visible === false) {
    return renderDeniedSection(
      context,
      section,
      diagnostics,
      governance,
      renderResolvedSection
    );
  }

  try {
    const element = renderResolvedSection(
      createGovernedSectionContext(context, section)
    );

    emitMetadataTelemetry(context, "metadata.section.render.completed", {
      attributes: {
        sectionKey: section.key,
        sectionKind: section.kind ?? "section",
      },
      diagnostics,
      governanceDecision: governance.decision,
      level: "info",
      rendererKey: section.kind ?? "section",
    });

    return { diagnostics, element };
  } catch (error) {
    const result = createSectionRenderError(
      section,
      diagnostics,
      error,
      context.correlationId
    );

    emitMetadataTelemetry(context, "metadata.section.render.error", {
      attributes: {
        message: result.diagnostics.at(-1)?.message ?? "render failed",
        sectionKey: section.key,
      },
      diagnostics: result.diagnostics,
      level: "error",
      rendererKey: section.kind ?? "section",
    });

    return result;
  }
}
