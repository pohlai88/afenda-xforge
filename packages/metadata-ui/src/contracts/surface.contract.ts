import type { ReactElement, ReactNode } from "react";

import type { MetadataCompositionContract } from "./composition.contract";
import type { MetadataGovernancePolicy } from "./governance.contract";
import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataSurfaceKind =
  | "dashboard"
  | "detail"
  | "form"
  | "list"
  | "workflow";

export type MetadataSurfaceContract = {
  key: string;
  kind: MetadataSurfaceKind;
  title: string;
  version: string;
  description?: string;
  governance?: MetadataGovernancePolicy;
  composition?: MetadataCompositionContract;
  metadata?: Record<string, unknown>;
};

export type MetadataSurfaceRendererProps = {
  children?: ReactNode;
  context: MetadataRenderContext;
  surface: MetadataSurfaceContract;
};

export type MetadataSurfaceRenderer = (
  props: MetadataSurfaceRendererProps
) => ReactElement | null;
