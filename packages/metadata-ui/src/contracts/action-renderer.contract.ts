import type { ReactElement } from "react";

import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataActionKind = "button" | "destructive" | "menu";

export type MetadataActionContract = {
  confirm?: string;
  disabled?: boolean;
  href?: string;
  kind?: MetadataActionKind;
  key: string;
  label: string;
  title?: string;
};

export type MetadataActionRendererProps = {
  action: MetadataActionContract;
  context: MetadataRenderContext;
  onAction?: (action: MetadataActionContract) => void;
};

export type MetadataActionRenderer = (
  props: MetadataActionRendererProps
) => ReactElement | null;
