// Description: Split button with dropdown trigger
// Order: 39

"use client";

import { Button } from "../../ui-shadcn/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "../../ui-shadcn/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupSplitButtonWithDropdownTrigger() {
  return (
    <ButtonGroup className="**:data-[slot=button]:border-x-0">
      <Button variant="default">Save</Button>
      <ButtonGroupSeparator className="bg-primary-foreground/10" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="default" size="icon" aria-label="More options" />
          }
        >
          <IconPlaceholder
            lucide="ChevronDownIcon"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Save and publish</DropdownMenuItem>
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
          <DropdownMenuItem>Save and exit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
