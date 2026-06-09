// Description: Horizontal button group with primary and secondary labels
// Order: 31

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup, ButtonGroupText } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupHorizontalWithPrimaryAndSecondaryLabels() {
  return (
    <ButtonGroup>
      <Button size="sm" className="border-primary">
        <IconPlaceholder
          lucide="Share2Icon"
          tabler="IconShare"
          hugeicons="Share08Icon"
          phosphor="ShareNetworkIcon"
          remixicon="RiStackshareLine"
          className="..."
        />
        Share
      </Button>
      <ButtonGroupText className="text-muted-foreground bg-transparent px-2">
        128 Shares
      </ButtonGroupText>
    </ButtonGroup>
  );
}
