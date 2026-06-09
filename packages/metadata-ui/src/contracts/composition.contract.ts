import type { MetadataGovernancePolicy } from "./governance.contract";

export type MetadataCompositionNodeKind =
  | "action"
  | "field"
  | "layout"
  | "section"
  | "surface";

export type MetadataCompositionNode = MetadataGovernancePolicy & {
  children?: readonly MetadataCompositionNode[];
  key: string;
  kind: MetadataCompositionNodeKind;
  order?: number;
  slot?: string;
};

export type MetadataCompositionContract = {
  nodes: readonly MetadataCompositionNode[];
  rootKey: string;
  version: string;
};
