import type { MetadataDiagnostic } from "../contracts/diagnostics.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";

export type DiagnosticsVisualDefinition = {
  codeClass: string;
  correlationClass: string;
  fallbackShellClass: string;
  messageClass: string;
  panelClass: string;
  panelTitleClass: string;
  severityClass: string;
  targetClass: string;
};

export const DIAGNOSTICS_VISUAL_DEFINITION: DiagnosticsVisualDefinition = {
  codeClass: "font-mono text-xs uppercase tracking-wide text-muted-foreground",
  correlationClass:
    "font-mono text-xs text-warning-foreground break-all rounded-md border border-dashed border-warning/40 bg-warning/5 px-2 py-1",
  fallbackShellClass:
    "metadata-diagnostics-fallback rounded-lg border border-dashed border-destructive/40 bg-destructive/5",
  messageClass: "text-sm leading-6 text-foreground",
  panelClass:
    "metadata-diagnostics-panel space-y-3 rounded-lg border border-dashed border-warning/50 bg-warning/5 p-4 shadow-sm",
  panelTitleClass: "font-semibold text-sm text-warning-foreground",
  severityClass: "font-medium text-xs uppercase tracking-wide",
  targetClass: "font-mono text-xs text-muted-foreground",
};

const uiVisibleSeverities = new Set<MetadataDiagnostic["severity"]>([
  "error",
  "warning",
]);

export function filterUiVisibleDiagnostics(
  diagnostics: readonly MetadataDiagnostic[]
): readonly MetadataDiagnostic[] {
  return diagnostics.filter((diagnostic) =>
    uiVisibleSeverities.has(diagnostic.severity)
  );
}

export function shouldSurfaceDiagnostics(
  context: MetadataRenderContext,
  diagnostics: readonly MetadataDiagnostic[]
): boolean {
  return (
    context.diagnosticsEnabled &&
    filterUiVisibleDiagnostics(diagnostics).length > 0
  );
}

export function resolveDiagnosticsEnabledProps(enabled: boolean): {
  "data-diagnostics-enabled"?: "true";
} {
  return enabled ? { "data-diagnostics-enabled": "true" } : {};
}

export function resolveDiagnosticsPanelProps(): {
  "data-diagnostics-panel": "true";
} {
  return { "data-diagnostics-panel": "true" };
}

export function resolveFallbackDiagnosticsShellClassName(
  context?: MetadataRenderContext
): string | undefined {
  if (!context?.diagnosticsEnabled) {
    return;
  }

  return DIAGNOSTICS_VISUAL_DEFINITION.fallbackShellClass;
}

export function resolveDiagnosticsCorrelationProps(correlationId: string): {
  "data-correlation-id": string;
} {
  return { "data-correlation-id": correlationId };
}
