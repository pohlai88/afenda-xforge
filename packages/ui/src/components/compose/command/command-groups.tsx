"use client";

import { Calendar, CreditCard, Settings, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui-shadcn/command";
import { ComposePatternCard } from "../compose.pattern-shell";
import { CommandGroup } from "./command.shared";

export function CommandGroups() {
  return (
    <ComposePatternCard
      title="Groups"
      description="Commands grouped by task area for denser operator workflows."
    >
      <Command className="rounded-lg border bg-background">
        <CommandInput placeholder="Jump to a workspace action..." />
        <CommandList>
          <CommandEmpty>No matching command.</CommandEmpty>
          <CommandGroup title="Navigation">
            <CommandItem>
              <Calendar className="size-4" />
              Calendar
            </CommandItem>
            <CommandItem>
              <User className="size-4" />
              Profile
            </CommandItem>
          </CommandGroup>
          <CommandGroup title="Settings" className="border-t border-border pt-2">
            <CommandItem>
              <CreditCard className="size-4" />
              Billing
            </CommandItem>
            <CommandItem>
              <Settings className="size-4" />
              Workspace settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </ComposePatternCard>
  );
}
