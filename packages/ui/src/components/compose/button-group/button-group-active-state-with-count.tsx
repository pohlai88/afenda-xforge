// Description: Active state button group with count
// Order: 30

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup, ButtonGroupText } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupActiveStateWithCount() {
  return (
    <ButtonGroup>
      <Button
        size="sm"
        variant="default"
        aria-label="Following 2.4k"
        className="border-primary"
      >
        <IconPlaceholder
          lucide="StarIcon"
          tabler="IconStar"
          hugeicons="StarIcon"
          phosphor="StarIcon"
          remixicon="RiStarLine"
        />
        Star
      </Button>
      <ButtonGroupText className="border-primary">2.4k</ButtonGroupText>
    </ButtonGroup>
  );
}
