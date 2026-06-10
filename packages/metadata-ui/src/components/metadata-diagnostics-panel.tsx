import { Badge } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataDiagnostic } from "../contracts/diagnostics.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import {
  DIAGNOSTICS_VISUAL_DEFINITION,
  filterUiVisibleDiagnostics,
  resolveDiagnosticsCorrelationProps,
  resolveDiagnosticsEnabledProps,
  resolveDiagnosticsPanelProps,
  shouldSurfaceDiagnostics,
} from "../visualization/diagnostics-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export type MetadataDiagnosticsPanelProps = {
  context: MetadataRenderContext;
  diagnostics: readonly MetadataDiagnostic[];
  title?: string;
};

export function MetadataDiagnosticsPanel({
  context,
  diagnostics,
  title = "Metadata diagnostics",
}: MetadataDiagnosticsPanelProps): ReactElement | null {
  const visibleDiagnostics = filterUiVisibleDiagnostics(diagnostics);

  if (!shouldSurfaceDiagnostics(context, diagnostics)) {
    return null;
  }

  return (
    <aside
      aria-label={title}
      className={DIAGNOSTICS_VISUAL_DEFINITION.panelClass}
      {...resolveDiagnosticsPanelProps()}
      {...resolveDiagnosticsEnabledProps(true)}
    >
      <div className="space-y-2">
        <h3 className={DIAGNOSTICS_VISUAL_DEFINITION.panelTitleClass}>
          {title}
        </h3>
        <p
          className={DIAGNOSTICS_VISUAL_DEFINITION.correlationClass}
          {...resolveDiagnosticsCorrelationProps(context.correlationId)}
        >
          Correlation ID: {context.correlationId}
        </p>
      </div>

      <ul className="space-y-2">
        {visibleDiagnostics.map((diagnostic) => (
          <li
            className="space-y-1 rounded-md border border-border/60 bg-background/80 p-3"
            data-diagnostic-code={diagnostic.code}
            key={`${diagnostic.code}-${diagnostic.target ?? diagnostic.message}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  diagnostic.severity === "error" ? "destructive" : "warning"
                }
              >
                <span className={DIAGNOSTICS_VISUAL_DEFINITION.severityClass}>
                  {diagnostic.severity}
                </span>
              </Badge>
              <span className={DIAGNOSTICS_VISUAL_DEFINITION.codeClass}>
                {diagnostic.code}
              </span>
              {diagnostic.target ? (
                <span className={DIAGNOSTICS_VISUAL_DEFINITION.targetClass}>
                  target: {diagnostic.target}
                </span>
              ) : null}
            </div>
            <p className={DIAGNOSTICS_VISUAL_DEFINITION.messageClass}>
              {diagnostic.message}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export type MetadataDiagnosticsCorrelationFooterProps = {
  context?: MetadataRenderContext;
  correlationId?: string;
};

export function MetadataDiagnosticsCorrelationFooter({
  context,
  correlationId,
}: MetadataDiagnosticsCorrelationFooterProps): ReactElement | null {
  if (!(context?.diagnosticsEnabled && correlationId)) {
    return null;
  }

  return (
    <p
      className={cn("mt-3", DIAGNOSTICS_VISUAL_DEFINITION.correlationClass)}
      {...resolveDiagnosticsCorrelationProps(correlationId)}
    >
      Correlation ID: {correlationId}
    </p>
  );
}
