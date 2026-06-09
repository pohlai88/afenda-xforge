"use client";

import { Button } from "../../ui-shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import {
  ComposePatternCard,
  ComposePatternStage,
} from "../compose.pattern-shell";

export function DropdownMenuBasic() {
  return (
    <ComposePatternCard
      title="Basic"
      description="A standard action menu for account and support links."
    >
      <ComposePatternStage>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Open</Button>}
          />
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem disabled>API</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComposePatternStage>
    </ComposePatternCard>
  );
}
