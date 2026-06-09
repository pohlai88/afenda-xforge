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

const fruits = ["Apple", "Banana", "Orange", "Pineapple", "Grape", "Mango"];

export function ComboboxBasic() {
  return (
    <Combobox items={fruits} defaultValue="Apple">
      <ComboboxPatternCard
        description="A filterable select with a labeled input and a popup list."
        title="A basic combobox with a list of options"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-basic">
            Choose a fruit
          </label>
          <ComboboxInput id="combobox-basic" placeholder="e.g. Apple" />
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No fruits found.</ComboboxEmpty>
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
