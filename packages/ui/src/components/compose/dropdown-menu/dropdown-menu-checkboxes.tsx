"use client";

import { useState } from "react";
import { Button } from "../../ui-shadcn/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import {
  ComposePatternCard,
  ComposePatternStage,
} from "../compose.pattern-shell";

export function DropdownMenuCheckboxes() {
  const [showName, setShowName] = useState(true);
  const [showRole, setShowRole] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  return (
    <ComposePatternCard
      title="Checkboxes"
      description="Visibility toggles for dense collection views."
    >
      <ComposePatternStage>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Columns</Button>}
          />
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                checked={showName}
                onCheckedChange={(value) => setShowName(Boolean(value))}
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showRole}
                onCheckedChange={(value) => setShowRole(Boolean(value))}
              >
                Role
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showStatus}
                onCheckedChange={(value) => setShowStatus(Boolean(value))}
              >
                Status
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComposePatternStage>
    </ComposePatternCard>
  );
}
