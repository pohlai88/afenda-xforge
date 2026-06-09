import type { ReactElement } from "react";

import type { MetadataDiagnostic } from "./diagnostics.contract";
import type { MetadataGovernancePolicy } from "./governance.contract";
import type { MetadataRenderContext } from "./render-context.contract";

export const metadataActionKinds = [
  "approve",
  "archive",
  "create",
  "custom",
  "delete",
  "reject",
  "restore",
  "submit",
  "update",
] as const;

export type MetadataActionKind = (typeof metadataActionKinds)[number];

export type MetadataActionPlacement =
  | "overflow"
  | "primary"
  | "row"
  | "secondary";

export type MetadataActionSurface = "button" | "destructive" | "menu";

export type MetadataActionConfirmationPolicy = {
  message: string;
  required?: boolean;
  title?: string;
};

export type MetadataActionContract = MetadataGovernancePolicy & {
  actionId?: string;
  confirmMessage?: string;
  confirmationPolicy?: MetadataActionConfirmationPolicy;
  description?: string;
  dangerous?: boolean;
  disabled?: boolean;
  href?: string;
  key: string;
  kind: MetadataActionKind;
  label: string;
  metadata?: Record<string, unknown>;
  permissionHint?: string;
  placement?: MetadataActionPlacement;
  rel?: string;
  requiresSelection?: boolean;
  stateTransition?: {
    from?: readonly string[];
    to?: string;
  };
  surface?: MetadataActionSurface;
  target?: "_blank" | "_parent" | "_self" | "_top";
  title?: string;
};

export type MetadataActionRendererProps = {
  action: MetadataActionContract;
  context: MetadataRenderContext;
  diagnostics?: readonly MetadataDiagnostic[];
  onAction?: (action: MetadataActionContract) => void;
};

const destructiveActionKinds = new Set<MetadataActionKind>([
  "archive",
  "delete",
  "reject",
]);

export function resolveMetadataActionSurface(
  action: MetadataActionContract
): MetadataActionSurface {
  if (action.surface) {
    return action.surface;
  }

  if (action.placement === "overflow") {
    return "menu";
  }

  if (
    action.dangerous ||
    action.confirmationPolicy?.required ||
    action.confirmationPolicy?.message ||
    action.confirmMessage ||
    destructiveActionKinds.has(action.kind)
  ) {
    return "destructive";
  }

  return "button";
}

export type MetadataActionRenderer = (
  props: MetadataActionRendererProps
) => ReactElement | null;
