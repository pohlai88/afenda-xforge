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

export function ComboboxWithClearButton() {
  return (
    <Combobox items={options} defaultValue="Banana">
      <ComboboxPatternCard
        description="A clear button resets the selected value."
        title="A combobox with a clear button"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-clear">
            Choose a fruit
          </label>
          <ComboboxInput
            id="combobox-clear"
            placeholder="Try clearing the selection"
            showClear
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
