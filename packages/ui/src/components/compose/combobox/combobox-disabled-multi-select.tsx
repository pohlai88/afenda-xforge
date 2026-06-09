"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPatternCard,
  ComboboxValue,
} from "./combobox.shared";

const languages = ["TypeScript", "JavaScript", "Rust", "Go", "Python"];

export function ComboboxDisabledMultiSelect() {
  return (
    <Combobox disabled multiple items={languages} defaultValue={["TypeScript"]}>
      <ComboboxPatternCard
        description="The entire multi-select is read-only and visually muted."
        title="A disabled multi-select combobox"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="combobox-disabled-multi"
          >
            Programming languages
          </label>
          <ComboboxChips className="opacity-60">
            <ComboboxValue>
              {(selectedValue: string[]) =>
                selectedValue.map((item) => (
                  <ComboboxChip key={item} className="opacity-70">
                    {item}
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              disabled
              id="combobox-disabled-multi"
              placeholder="Disabled"
            />
          </ComboboxChips>
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
