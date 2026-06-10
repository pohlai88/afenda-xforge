import type { ReactElement, ReactNode } from "react";

import type { MetadataActionContract } from "./action-renderer.contract";
import type { MetadataDiagnostic } from "./diagnostics.contract";
import type { MetadataFieldContract } from "./field-renderer.contract";
import type { MetadataGovernancePolicy } from "./governance.contract";
import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataSectionKind =
  | "activity"
  | "approval"
  | "card"
  | "chart"
  | "dashboard"
  | "details"
  | "evidence"
  | "form"
  | "kanban"
  | "list"
  | "section"
  | "stat"
  | "table"
  | "timeline"
  | "workflow";

export const metadataSectionKinds = [
  "activity",
  "approval",
  "card",
  "chart",
  "dashboard",
  "details",
  "evidence",
  "form",
  "kanban",
  "list",
  "section",
  "stat",
  "table",
  "timeline",
  "workflow",
] as const satisfies readonly MetadataSectionKind[];

export type MetadataSectionRow = Readonly<Record<string, unknown>> & {
  id: string;
};

export type MetadataSectionMetadata = Record<string, unknown>;

export type MetadataSectionContract<
  TMetadata = MetadataSectionMetadata,
  TRow extends MetadataSectionRow = MetadataSectionRow,
> = MetadataGovernancePolicy & {
  actions?: readonly MetadataActionContract[];
  description?: string;
  fields?: readonly MetadataFieldContract[];
  key: string;
  kind?: MetadataSectionKind;
  metadata?: TMetadata;
  metadataAttributes?: Record<string, unknown>;
  order?: number;
  rows?: readonly TRow[];
  title: string;
  visible?: boolean;
};

export type MetadataSectionRendererProps<
  TMetadata = MetadataSectionMetadata,
  TRow extends MetadataSectionRow = MetadataSectionRow,
> = {
  children?: ReactNode;
  context: MetadataRenderContext;
  diagnostics?: readonly MetadataDiagnostic[];
  section: MetadataSectionContract<TMetadata, TRow>;
};

export type MetadataSectionRenderer<
  TMetadata = MetadataSectionMetadata,
  TRow extends MetadataSectionRow = MetadataSectionRow,
> = (
  props: MetadataSectionRendererProps<TMetadata, TRow>
) => ReactElement | null;
