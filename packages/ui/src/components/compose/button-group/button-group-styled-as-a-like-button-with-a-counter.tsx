// Description: Button group styled as a like button with a counter
// Order: 8

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupStyledAsALikeButtonWithACounter() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <IconPlaceholder
          lucide="HeartIcon"
          tabler="IconHeart"
          hugeicons="FavouriteIcon"
          phosphor="HeartIcon"
          remixicon="RiHeartLine"
          aria-hidden="true"
        />
        Like
      </Button>
      <Button
        variant="outline"
        className="w-12"
        render={<span />}
        nativeButton={false}
      >
        1.2K
      </Button>
    </ButtonGroup>
  );
}
