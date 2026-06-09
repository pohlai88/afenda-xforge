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

export function ComboboxInvalid() {
  return (
    <Combobox aria-invalid items={options}>
      <ComboboxPatternCard
        description="An invalid state can be used to surface form validation."
        title="A combobox in an invalid state"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-invalid">
            Choose a fruit
          </label>
          <ComboboxInput
            aria-invalid
            id="combobox-invalid"
            placeholder="Select a valid value"
          />
          <p className="text-sm text-destructive">
            Please select one of the available fruits.
          </p>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No options match.</ComboboxEmpty>
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
