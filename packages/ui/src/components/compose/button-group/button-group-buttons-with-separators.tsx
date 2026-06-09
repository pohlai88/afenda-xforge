// Description: Button group buttons with separators
// Order: 23

import { Button } from "../../ui-shadcn/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "../../ui-shadcn/button-group";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupButtonsWithSeparators() {
  return (
    <ButtonGroup className="**:data-[slot=button]:border-0">
      <Button aria-label="Files">
        <IconPlaceholder
          lucide="FileIcon"
          tabler="IconFile"
          hugeicons="FileEmpty02Icon"
          phosphor="FileIcon"
          remixicon="RiFileLine"
          aria-hidden="true"
        />
        Files
      </Button>
      <ButtonGroupSeparator className="bg-primary/72" />
      <Button aria-label="Folder">
        <IconPlaceholder
          lucide="FolderIcon"
          tabler="IconFolder"
          hugeicons="FolderIcon"
          phosphor="FolderIcon"
          remixicon="RiFolderLine"
          aria-hidden="true"
        />
        Folder
      </Button>
      <ButtonGroupSeparator className="bg-primary/72" />
      <Button aria-label="Trash">
        <IconPlaceholder
          lucide="ImageIcon"
          tabler="IconPhoto"
          hugeicons="ImageIcon"
          phosphor="ImageIcon"
          remixicon="RiImageLine"
          aria-hidden="true"
        />
        Media
      </Button>
    </ButtonGroup>
  );
}
