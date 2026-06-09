"use client";

import { Bell, Calendar, CreditCard, Search, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui-shadcn/button";
import {
  CommandDialog as CommandDialogPrimitive,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui-shadcn/command";
import { ComposePatternCard } from "../compose.pattern-shell";

export function CommandDialogPattern() {
  const [open, setOpen] = useState(false);

  return (
    <ComposePatternCard
      title="Dialog"
      description="A global command palette opened from a compact trigger."
    >
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">Global search</p>
          <p className="text-sm text-muted-foreground">
            Launch a command dialog for navigation and actions.
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Search className="size-4" />
          Open palette
        </Button>
      </div>
      <CommandDialogPrimitive open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="size-4" />
              Calendar
            </CommandItem>
            <CommandItem>
              <Bell className="size-4" />
              Notifications
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Workspace">
            <CommandItem>
              <CreditCard className="size-4" />
              Billing
            </CommandItem>
            <CommandItem>
              <Settings className="size-4" />
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialogPrimitive>
    </ComposePatternCard>
  );
}
