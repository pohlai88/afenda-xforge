"use client";

import { Button } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";
import { metadataActionToEnterpriseDropdownItem } from "../../components/build-enterprise-dropdown-from-metadata";
import { EnterpriseDropdownMenu } from "../../components/enterprise-dropdown-menu";

export function MenuActionSurface({
  action,
  context,
  onAction,
}: MetadataActionRendererProps): ReactElement {
  return (
    <EnterpriseDropdownMenu
      items={[
        metadataActionToEnterpriseDropdownItem(action, context, {
          onAction,
        }),
      ]}
      trigger={
        <Button
          aria-haspopup="menu"
          data-action-surface="menu"
          disabled={action.disabled}
          size="sm"
          type="button"
          variant="ghost"
        >
          {action.label}
        </Button>
      }
    />
  );
}
