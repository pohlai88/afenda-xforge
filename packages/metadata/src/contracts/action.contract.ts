import type { MetadataActionKind } from "../constants/action-kinds.ts";
import type { MetadataActionCustomizationPolicy } from "./customization-policy.contract.ts";
import type { MetadataNodeId } from "./id.contract.ts";

export type MetadataActionPlacement =
  | "overflow"
  | "primary"
  | "row"
  | "secondary";

export type MetadataActionContract = {
  confirmMessage?: string;
  customization?: MetadataActionCustomizationPolicy;
  description?: string;
  dangerous?: boolean;
  id?: MetadataNodeId;
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
