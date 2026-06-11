"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@repo/ui";
import { Keyboard } from "lucide-react";
import type { ReactElement } from "react";
import { useRouter } from "@/i18n/navigation";
import type { WorkspaceShortcutsPayload } from "../../../../lib/workspace-shortcuts/contract.ts";
import { formatShortcutLabel } from "../../../../lib/workspace-shortcuts/format-shortcut.ts";
import { AUTHENTICATED_NAV_ITEMS } from "../../authenticated-workspace-nav.ts";

export function WorkspaceCommandPalette({
  onOpenChange,
  onOpenHelp,
  open,
  payload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenHelp: () => void;
  payload: WorkspaceShortcutsPayload;
}): ReactElement {
  const router = useRouter();

  const runCommand = (command: () => void): void => {
    onOpenChange(false);
    command();
  };

  const helpLabel = formatShortcutLabel(
    payload.bindings["workspace.openShortcutHelp"].binding.normalized
  );

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandInput placeholder="Search workspace commands..." />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {AUTHENTICATED_NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Workspace">
          <CommandItem onSelect={() => runCommand(onOpenHelp)}>
            <Keyboard className="size-4" />
            Keyboard shortcuts help
            <CommandShortcut>{helpLabel}</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
