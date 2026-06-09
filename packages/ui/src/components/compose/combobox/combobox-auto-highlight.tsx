"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPatternCard,
} from "./combobox.shared";

const options = ["Apple", "Banana", "Orange", "Grape", "Mango"];

export function ComboboxAutoHighlight() {
  return (
    <Combobox autoHighlight items={options}>
      <ComboboxPatternCard
        description="Keyboard focus follows the first matching result as you type."
        title="A combobox with auto-highlight enabled"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="combobox-auto-highlight"
          >
            Search produce
          </label>
          <ComboboxInput
            id="combobox-auto-highlight"
            placeholder="Start typing a fruit"
          />
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
