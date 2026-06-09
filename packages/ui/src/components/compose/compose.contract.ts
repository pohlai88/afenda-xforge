import type * as React from "react";

export type ComposeComponentKind =
  | "action"
  | "data-display"
  | "data-entry"
  | "feedback"
  | "interaction"
  | "layout"
  | "navigation"
  | "visualization";

export type ComposeMetadataRole =
  | "action"
  | "collection"
  | "feedback"
  | "field"
  | "layout"
  | "metric"
  | "navigation"
  | "section"
  | "state"
  | "visualization";

export type ComposeCapability =
  | "async"
  | "bulk-action"
  | "controlled"
  | "crud"
  | "density"
  | "drag-and-drop"
  | "empty-state"
  | "filtering"
  | "form"
  | "loading-state"
  | "pagination"
  | "selection"
  | "sorting"
  | "summary"
  | "validation"
  | "virtualization";

export type ComposeReadiness = "metadata-ready" | "preview-only";

export type ComposePatternSpec = {
  component?: React.ComponentType;
  description: string;
  name: string;
  title: string;
};

export type ComposeRegistryGroup = {
  capabilities: readonly ComposeCapability[];
  description: string;
  kind: ComposeComponentKind;
  metadataRoles: readonly ComposeMetadataRole[];
  name: string;
  patterns: readonly ComposePatternSpec[];
  readiness: ComposeReadiness;
  title: string;
};
