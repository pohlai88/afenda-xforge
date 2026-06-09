"use client";

import { SearchIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPatternCard,
} from "./combobox.shared";

const options = ["Apple", "Banana", "Orange", "Grape"];

export function ComboboxWithIconAddon() {
  return (
    <Combobox items={options}>
      <ComboboxPatternCard
        description="A decorative icon reinforces that the field is searchable."
        title="A combobox with an icon addon"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-icon-addon">
            Search fruit
          </label>
          <ComboboxInput
            className="[&_[data-slot=input-group-control]]:pl-9"
            id="combobox-icon-addon"
            placeholder="Search produce"
          >
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </ComboboxInput>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No matches.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPatternCard>
    </Combobox>
  );
}
