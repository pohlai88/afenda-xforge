// Description: Basic button group with two buttons
// Order: 1

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";

export function ButtonGroupBasicWithTwoButtons() {
  return (
    <ButtonGroup>
      <Button variant="outline">Button</Button>
      <Button variant="outline">Another Button</Button>
    </ButtonGroup>
  );
}
