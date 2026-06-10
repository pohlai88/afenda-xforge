import type { ReactElement } from "react";

import { MetadataDiagnosticsCorrelationFooter } from "../../components/metadata-diagnostics-panel";
import type { MetadataRenderContext } from "../../contracts/render-context.contract";
import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { resolveFallbackDiagnosticsShellClassName } from "../../visualization/diagnostics-visual-contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

type ErrorStateProps = {
  context?: MetadataRenderContext;
  correlationId?: string;
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({
  context,
  correlationId,
  description,
  onRetry,
  title,
}: ErrorStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("error");
  const fallbackShellClass = resolveFallbackDiagnosticsShellClassName(context);

  return (
    <div className={cn(fallbackShellClass)} data-fallback-surface="true">
      <MetadataStateShell
        action={
          onRetry
            ? {
                label: definition.actionLabel ?? "Retry",
                onClick: onRetry,
              }
            : undefined
        }
        description={description}
        stateKind="error"
        title={title}
      />
      <MetadataDiagnosticsCorrelationFooter
        context={context}
        correlationId={correlationId ?? context?.correlationId}
      />
    </div>
  );
}

export const ErrorStateRenderer: MetadataStateRenderer = ({
  error,
  onRetry,
}) => <ErrorState description={error} onRetry={onRetry} />;
