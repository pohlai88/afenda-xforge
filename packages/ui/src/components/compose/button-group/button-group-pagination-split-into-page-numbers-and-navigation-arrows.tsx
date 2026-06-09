// Description: Pagination split into page numbers and navigation arrows
// Order: 11

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupPaginationSplitIntoPageNumbersAndNavigationArrows() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon-sm">
          <IconPlaceholder
            lucide="ArrowLeftIcon"
            tabler="IconArrowLeft"
            hugeicons="ArrowLeft02Icon"
            phosphor="ArrowLeftIcon"
            remixicon="RiArrowLeftLine"
            aria-hidden="true"
          />
        </Button>
        <Button variant="outline" size="sm">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="icon-sm">
          <IconPlaceholder
            lucide="ArrowRightIcon"
            tabler="IconArrowRight"
            hugeicons="ArrowRight02Icon"
            phosphor="ArrowRightIcon"
            remixicon="RiArrowRightLine"
            aria-hidden="true"
          />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
