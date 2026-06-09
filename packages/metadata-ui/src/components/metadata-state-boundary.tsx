import type { ReactElement, ReactNode } from "react";
import { renderMetadataState } from "../adapters";
import type {
  MetadataRenderContext,
  MetadataUiState,
} from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";

export type MetadataStateBoundaryProps = {
  children?: ReactNode;
  context?: Partial<MetadataRenderContext>;
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
  context,
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
  const resolvedContext = createMetadataRenderContext(context, { state });

  return renderMetadataState({
    children,
    context: resolvedContext,
    emptyDescription,
    emptyTitle,
    error,
    forbiddenDescription,
    forbiddenTitle,
    loadingDescription,
    loadingTitle,
    onRetry,
    state,
  }).element;
}
