import type { ReactElement, ReactNode } from "react";

import { EmptyState } from "../renderers/states/empty-state.renderer";
import { ErrorState } from "../renderers/states/error-state.renderer";
import { ForbiddenState } from "../renderers/states/forbidden-state.renderer";
import { LoadingState } from "../renderers/states/loading-state.renderer";
import { ReadyState } from "../renderers/states/ready-state.renderer";
import type { MetadataRendererDiagnostic } from "./diagnostics";

export const metadataUiStateKeys = [
  "loading",
  "empty",
  "error",
  "forbidden",
  "ready",
  "invalid",
  "degraded",
  "partial",
  "readonly",
  "maintenance",
] as const;

export type MetadataStateRendererProps = {
  children?: ReactNode;
  diagnostics?: readonly MetadataRendererDiagnostic[];
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string;
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  loadingDescription?: string;
  loadingTitle?: string;
  onRetry?: () => void;
};

export type MetadataStateRenderer = (
  props: MetadataStateRendererProps
) => ReactElement | null;

const renderEmptyState = ({
  emptyDescription,
  emptyTitle,
}: MetadataStateRendererProps): ReactElement => (
  <EmptyState description={emptyDescription} title={emptyTitle} />
);

const renderErrorState = ({
  error,
  onRetry,
}: MetadataStateRendererProps): ReactElement => (
  <ErrorState
    description={error}
    onRetry={onRetry}
    title="Unable to load records"
  />
);

const renderForbiddenState = ({
  forbiddenDescription,
  forbiddenTitle,
}: MetadataStateRendererProps): ReactElement => (
  <ForbiddenState description={forbiddenDescription} title={forbiddenTitle} />
);

const renderLoadingState = ({
  loadingDescription,
  loadingTitle,
}: MetadataStateRendererProps): ReactElement => (
  <LoadingState description={loadingDescription} title={loadingTitle} />
);

const renderReadyState = ({
  children,
}: MetadataStateRendererProps): ReactElement => (
  <ReadyState>{children}</ReadyState>
);

const renderInvalidState = ({
  error,
  onRetry,
}: MetadataStateRendererProps): ReactElement => (
  <ErrorState
    description={error ?? "The metadata contract is invalid."}
    onRetry={onRetry}
    title="Invalid metadata surface"
  />
);

const renderDegradedState = ({
  error,
  onRetry,
}: MetadataStateRendererProps): ReactElement => (
  <ErrorState
    description={error ?? "Some metadata capabilities are unavailable."}
    onRetry={onRetry}
    title="Metadata surface degraded"
  />
);

const renderMaintenanceState = ({
  forbiddenDescription,
}: MetadataStateRendererProps): ReactElement => (
  <ForbiddenState
    description={
      forbiddenDescription ??
      "This metadata surface is temporarily unavailable."
    }
    title="Maintenance mode"
  />
);

export const createMissingStateRenderer = (
  diagnostic: MetadataRendererDiagnostic
): MetadataStateRenderer =>
  function MissingStateRenderer({
    onRetry,
  }: MetadataStateRendererProps): ReactElement {
    return (
      <ErrorState
        description={diagnostic.message}
        onRetry={onRetry}
        title="Unsupported metadata state"
      />
    );
  };

export const stateRenderers: Partial<Record<string, MetadataStateRenderer>> = {
  degraded: renderDegradedState,
  empty: renderEmptyState,
  error: renderErrorState,
  forbidden: renderForbiddenState,
  invalid: renderInvalidState,
  loading: renderLoadingState,
  maintenance: renderMaintenanceState,
  partial: renderReadyState,
  ready: renderReadyState,
  readonly: renderReadyState,
};
