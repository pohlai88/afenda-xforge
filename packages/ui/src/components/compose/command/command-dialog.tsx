"use client";

import { Bell, Calendar, CreditCard, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Kbd, KbdGroup } from "../../ui-shadcn/kbd";
import { ComposePatternCard } from "../compose.pattern-shell";

export function CommandDialogPattern() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      setOpen((currentOpen) => !currentOpen);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
        <div className="flex items-center gap-2">
          <KbdGroup className="hidden sm:inline-flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Search className="size-4" />
            Open palette
          </Button>
        </div>
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
