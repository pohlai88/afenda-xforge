import type { MetadataActionKind } from "../constants/action-kinds.ts";

export type MetadataActionPlacement =
  | "overflow"
  | "primary"
  | "row"
  | "secondary";

export type MetadataActionContract = {
  confirmMessage?: string;
  description?: string;
  dangerous?: boolean;
  kind: MetadataActionKind;
  key: string;
  label: string;
  permissionHint?: string;
  placement?: MetadataActionPlacement;
  requiresSelection?: boolean;
  stateTransition?: {
    from?: readonly string[];
    to?: string;
  };
};
