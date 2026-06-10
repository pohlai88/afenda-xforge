import type { ReactElement, ReactNode } from "react";

import type {
  MetadataRenderContext,
  MetadataUiState,
} from "./render-context.contract";

export type MetadataStateKind = MetadataUiState;

export type MetadataStateRendererProps = {
  actionLabel?: string;
  children?: ReactNode;
  context?: MetadataRenderContext;
  diagnostics?: readonly {
    code: string;
    correlationId: string;
    message: string;
  }[];
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string;
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  loadingDescription?: string;
  loadingTitle?: string;
  onAction?: () => void;
  onRetry?: () => void;
};

export type MetadataStateRenderer = (
  props: MetadataStateRendererProps
) => ReactElement | null;
