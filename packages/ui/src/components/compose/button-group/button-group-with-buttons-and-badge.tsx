// Description: Button group with buttons and badge
// Order: 3

import { Badge } from "../../ui-shadcn/badge";

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupWithButtonsAndBadge() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <IconPlaceholder
          lucide="FileTextIcon"
          tabler="IconFileText"
          hugeicons="File02Icon"
          phosphor="FileTextIcon"
          remixicon="RiFileTextLine"
          aria-hidden="true"
        />
        <Badge variant="warning-light">Draft</Badge>
      </Button>

      <Button variant="outline">
        <IconPlaceholder
          lucide="PencilIcon"
          tabler="IconPencil"
          hugeicons="PenIcon"
          phosphor="PencilIcon"
          remixicon="RiPencilLine"
          aria-hidden="true"
        />
        <span>Edit</span>
      </Button>

      <Button variant="outline" size="icon" aria-label="Upload file">
        <IconPlaceholder
          lucide="UploadIcon"
          tabler="IconUpload"
          hugeicons="Upload01Icon"
          phosphor="UploadSimple"
          remixicon="RiUpload2Line"
          aria-hidden="true"
        />
      </Button>
    </ButtonGroup>
  );
}
