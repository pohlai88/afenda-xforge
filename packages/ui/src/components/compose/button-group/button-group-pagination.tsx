// Description: Pagination button group
// Order: 35

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupPagination() {
  return (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Go to previous page">
        <IconPlaceholder
          lucide="ChevronLeftIcon"
          tabler="IconChevronLeft"
          hugeicons="ArrowLeft01Icon"
          phosphor="CaretLeftIcon"
          remixicon="RiArrowLeftSLine"
          aria-hidden="true"
        />
      </Button>
      <Button variant="outline" size="icon" aria-label="Page 1">
        1
      </Button>
      <Button variant="outline" size="icon" aria-label="Page 2">
        2
      </Button>
      <Button
        variant="default"
        size="icon"
        className="border-primary border"
        aria-label="Page 3"
        aria-current="page"
      >
        3
      </Button>
      <Button variant="outline" size="icon" aria-label="Page 4">
        4
      </Button>
      <Button variant="outline" size="icon" aria-label="Page 5">
        5
      </Button>
      <Button variant="outline" size="icon" aria-label="Go to next page">
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
          aria-hidden="true"
        />
      </Button>
    </ButtonGroup>
  );
}
