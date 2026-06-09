// Description: View switcher button group
// Order: 36

import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupViewSwitcher() {
  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        className={cn("bg-muted")}
        aria-label="List view"
      >
        <IconPlaceholder
          lucide="ListIcon"
          tabler="IconList"
          hugeicons="Menu01Icon"
          phosphor="ListIcon"
          remixicon="RiListUnordered"
          aria-hidden="true"
        />
      </Button>
      <Button variant="outline" size="icon" aria-label="Grid view">
        <IconPlaceholder
          lucide="LayoutGridIcon"
          tabler="IconLayoutGrid"
          hugeicons="GridViewIcon"
          phosphor="SquaresFourIcon"
          remixicon="RiGalleryView2"
          aria-hidden="true"
        />
      </Button>
      <Button variant="outline" size="icon" aria-label="Table view">
        <IconPlaceholder
          lucide="TableIcon"
          tabler="IconTable"
          hugeicons="GridTableIcon"
          phosphor="GridNineIcon"
          remixicon="RiTable2"
          aria-hidden="true"
        />
      </Button>
    </ButtonGroup>
  );
}
