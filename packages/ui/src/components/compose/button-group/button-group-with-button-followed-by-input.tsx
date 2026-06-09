// Description: Button group with button followed by input
// Order: 2

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { Input } from "../../ui-shadcn/input";

export function ButtonGroupWithButtonFollowedByInput() {
  return (
    <ButtonGroup>
      <Button variant="outline">Button</Button>
      <Input placeholder="Type something here..." />
    </ButtonGroup>
  );
}
