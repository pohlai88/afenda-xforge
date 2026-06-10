"use client";

import { Globe, Plus, Settings2, UserCircle2 } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../../ui-shadcn/command";
import { ComposePatternCard } from "../compose.pattern-shell";
import { CommandGroup } from "./command.shared";

export function CommandShortcuts() {
  return (
    <ComposePatternCard
      title="Shortcuts"
      description="Command items with explicit keyboard affordances."
    >
      <Command className="rounded-lg border bg-background">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandGroup title="Quick actions">
            <CommandItem>
              <Plus className="size-4" />
              New project
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Globe className="size-4" />
              Switch environment
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <UserCircle2 className="size-4" />
              Open profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings2 className="size-4" />
              Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </ComposePatternCard>
  );
}
