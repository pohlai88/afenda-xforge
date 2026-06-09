"use client";

import { Calendar, CreditCard, Settings, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui-shadcn/command";
import { ComposePatternCard } from "../compose.pattern-shell";

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
          <CommandGroup heading="Navigation">
            <CommandItem>
              <Calendar className="size-4" />
              Calendar
            </CommandItem>
            <CommandItem>
              <User className="size-4" />
              Profile
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
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
