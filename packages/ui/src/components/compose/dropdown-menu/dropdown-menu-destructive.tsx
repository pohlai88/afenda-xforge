"use client";

import { Download, Ellipsis, Trash2 } from "lucide-react";
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

export function DropdownMenuDestructive() {
  return (
    <ComposePatternCard
      title="Destructive"
      description="Action menus that separate destructive operations clearly."
    >
      <ComposePatternStage>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" aria-label="More actions" />
            }
          >
            <Ellipsis className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>File actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Download className="size-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <Trash2 className="size-4" />
                Delete asset
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComposePatternStage>
    </ComposePatternCard>
  );
}
