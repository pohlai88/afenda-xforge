import type { EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow } from "@repo/ui/types";
import type { ReactElement, ReactNode } from "react";

import type { MetadataActionContract } from "./action-renderer.contract";
import type { MetadataFieldContract } from "./field-renderer.contract";
import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataSectionKind = "card" | "form" | "section" | "table";

export type MetadataSectionContract = {
  actions?: readonly MetadataActionContract[];
  description?: string;
  fields?: readonly MetadataFieldContract[];
  key: string;
  kind?: MetadataSectionKind;
  metadata?: EntityMetadata;
  rows?: readonly DashboardTableRow[];
  title: string;
};

export type MetadataSectionRendererProps = {
  children?: ReactNode;
  context: MetadataRenderContext;
  section: MetadataSectionContract;
};

export type MetadataSectionRenderer = (
  props: MetadataSectionRendererProps
) => ReactElement | null;
