import type { ReactElement, ReactNode } from "react";

import type { MetadataUiState } from "../contracts/render-context.contract";
import { EmptyState } from "../renderers/states/empty-state.renderer";
import { ErrorState } from "../renderers/states/error-state.renderer";
import { ForbiddenState } from "../renderers/states/forbidden-state.renderer";
import { LoadingState } from "../renderers/states/loading-state.renderer";
import { ReadyState } from "../renderers/states/ready-state.renderer";

export type MetadataStateAdapterProps = {
  children?: ReactNode;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string;
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  loadingDescription?: string;
  loadingTitle?: string;
  onRetry?: () => void;
  state: MetadataUiState;
};

export function renderMetadataState({
  children,
  emptyDescription,
  emptyTitle,
  error,
  forbiddenDescription,
  forbiddenTitle,
  loadingDescription,
  loadingTitle,
  onRetry,
  state,
}: MetadataStateAdapterProps): ReactElement | null {
  if (state === "loading") {
    return (
      <LoadingState description={loadingDescription} title={loadingTitle} />
    );
  }

  if (state === "empty") {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  if (state === "error") {
    return (
      <ErrorState
        description={error}
        onRetry={onRetry}
        title="Unable to load records"
      />
    );
  }

  if (state === "forbidden") {
    return (
      <ForbiddenState
        description={forbiddenDescription}
        title={forbiddenTitle}
      />
    );
  }

  return <ReadyState>{children}</ReadyState>;
}
