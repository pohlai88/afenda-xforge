import type { ReactElement, ReactNode } from "react";

import type { MetadataGovernancePolicy } from "./governance.contract";
import type {
  MetadataRenderContext,
  MetadataRenderDensity,
} from "./render-context.contract";

export type MetadataLayoutKind =
  | "dashboard"
  | "grid"
  | "panel"
  | "stack"
  | "tabs"
  | "wizard";

export type MetadataLayoutContract = {
  key: string;
  kind: MetadataLayoutKind;

  title?: string;
  description?: string;

  governance?: MetadataGovernancePolicy;

  children?: readonly string[];

  order?: number;
  hidden?: boolean;

  density?: MetadataRenderDensity;

  metadata?: Record<string, unknown>;
};

export type MetadataLayoutRendererProps = {
  children?: ReactNode;
  context: MetadataRenderContext;
  layout: MetadataLayoutContract;
};

export type MetadataLayoutRenderer = (
  props: MetadataLayoutRendererProps
) => ReactElement | null;
