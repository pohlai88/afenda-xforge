// Description: Button group with follower count
// Order: 29

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup, ButtonGroupText } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupWithFollowerCount() {
  return (
    <ButtonGroup>
      <Button size="sm" variant="outline">
        <IconPlaceholder
          lucide="UserPlusIcon"
          tabler="IconUserPlus"
          hugeicons="UserAdd01Icon"
          phosphor="UserPlusIcon"
          remixicon="RiUserAddLine"
          aria-hidden="true"
        />
        Follow
      </Button>
      <ButtonGroupText className="text-muted-foreground">
        2.4k followers
      </ButtonGroupText>
    </ButtonGroup>
  );
}
