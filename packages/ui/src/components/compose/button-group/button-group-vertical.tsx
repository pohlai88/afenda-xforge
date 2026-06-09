// Description: Vertical button group
// Order: 40

import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";

export function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation="vertical">
      <Button variant="outline" className={cn("bg-muted justify-start")}>
        Dashboard
      </Button>
      <Button variant="outline" className="justify-start">
        Analytics
      </Button>
      <Button variant="outline" className="justify-start">
        Settings
      </Button>
      <Button variant="outline" className="justify-start">
        Help
      </Button>
    </ButtonGroup>
  );
}
