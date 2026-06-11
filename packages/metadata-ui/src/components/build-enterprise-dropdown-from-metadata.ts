import type { ReactNode } from "react";

import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import { resolveMetadataActionSurface } from "../contracts/action-renderer.contract";
import type {
  EnterpriseDropdownMenuGroup,
  EnterpriseDropdownMenuItem,
} from "../contracts/enterprise-dropdown-menu.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { resolveMetadataLabel } from "../localization/resolve-metadata-label";

export type BuildEnterpriseDropdownFromMetadataOptions = {
  actions: readonly MetadataActionContract[];
  context: MetadataRenderContext;
  iconForAction?: (action: MetadataActionContract) => ReactNode | undefined;
  onAction?: (action: MetadataActionContract) => void;
};

function isDestructiveMetadataAction(action: MetadataActionContract): boolean {
  if (action.dangerous) {
    return true;
  }

  return resolveMetadataActionSurface(action) === "destructive";
}

export function metadataActionToEnterpriseDropdownItem(
  action: MetadataActionContract,
  context: MetadataRenderContext,
  options?: {
    icon?: ReactNode;
    onAction?: (action: MetadataActionContract) => void;
  }
): EnterpriseDropdownMenuItem {
  return {
    destructive: isDestructiveMetadataAction(action),
    disabled: action.disabled,
    icon: options?.icon,
    key: action.key,
    label: resolveMetadataLabel(context, action),
    onSelect: options?.onAction
      ? (): void => {
          if (!action.disabled) {
            options.onAction?.(action);
          }
        }
      : undefined,
  };
}

export function buildEnterpriseDropdownGroupsFromMetadataActions({
  actions,
  context,
  iconForAction,
  onAction,
}: BuildEnterpriseDropdownFromMetadataOptions): EnterpriseDropdownMenuGroup[] {
  if (actions.length === 0) {
    return [];
  }

  return [
    {
      key: "metadata-actions",
      items: actions.map((action) =>
        metadataActionToEnterpriseDropdownItem(action, context, {
          icon: iconForAction?.(action),
          onAction,
        })
      ),
    },
  ];
}
