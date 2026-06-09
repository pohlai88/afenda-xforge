import type { ReactElement, ReactNode } from "react";
import { renderMetadataState } from "../adapters";
import type { MetadataUiState } from "../contracts/render-context.contract";

export type MetadataStateBoundaryProps = {
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

export function MetadataStateBoundary({
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
}: MetadataStateBoundaryProps): ReactElement | null {
  return renderMetadataState({
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
  });
}
