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

const options = ["Apple", "Banana", "Orange", "Grape"];

export function ComboboxDisabled() {
  return (
    <Combobox disabled items={options}>
      <ComboboxPatternCard
        description="The input and popup trigger are both disabled."
        title="A disabled combobox"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-disabled">
            Choose a fruit
          </label>
          <ComboboxInput
            disabled
            id="combobox-disabled"
            placeholder="Disabled"
          />
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No options.</ComboboxEmpty>
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
