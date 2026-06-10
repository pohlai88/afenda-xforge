// Description: Search input with filter menu and clear button
// Order: 16

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { Input } from "../../ui-shadcn/input";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupSearchInputWithFilterMenuAndClearButton() {
  return (
    <ButtonGroup className="max-w-xs">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" aria-label="Filter">
              <IconPlaceholder
                lucide="ListFilterIcon"
                tabler="IconFilter2"
                hugeicons="FilterMailIcon"
                phosphor="FunnelSimpleIcon"
                remixicon="RiFilter3Line"
                aria-hidden="true"
              />
              Filter
              <IconPlaceholder
                lucide="ChevronDownIcon"
                tabler="IconChevronDown"
                hugeicons="ArrowDown01Icon"
                phosphor="CaretDownIcon"
                remixicon="RiArrowDownSLine"
                aria-hidden="true"
              />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem>All Records</DropdownMenuItem>
          <DropdownMenuItem>Recent</DropdownMenuItem>
          <DropdownMenuItem>Archived</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Input aria-label="Filter records" placeholder="Filter records..." />
      <Button variant="outline" size="icon" aria-label="Clear search">
        <IconPlaceholder
          lucide="XIcon"
          tabler="IconX"
          hugeicons="MultiplicationSignIcon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
          aria-hidden="true"
        />
      </Button>
    </ButtonGroup>
  );
}
