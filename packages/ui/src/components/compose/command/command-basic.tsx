"use client";

import { Calculator, Search, Smile } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui-shadcn/command";
import { ComposePatternCard } from "../compose.pattern-shell";
import { CommandGroup } from "./command.shared";

export function CommandBasic() {
  return (
    <ComposePatternCard
      title="Basic"
      description="A compact command surface for quick lookup and selection."
    >
      <Command className="rounded-lg border bg-background">
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup title="Suggestions">
            <CommandItem>
              <Search className="size-4" />
              Search workspace
            </CommandItem>
            <CommandItem>
              <Smile className="size-4" />
              Search emoji
            </CommandItem>
            <CommandItem>
              <Calculator className="size-4" />
              Open calculator
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </ComposePatternCard>
  );
}
