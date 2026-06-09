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

export function ComboboxMultiSelectInvalid() {
  return (
    <Combobox
      aria-invalid
      multiple
      items={languages}
      defaultValue={["TypeScript"]}
    >
      <ComboboxPatternCard
        description="Validation can be surfaced with an invalid border and helper text."
        title="A multi-select combobox in an invalid state"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="combobox-multi-invalid"
          >
            Programming languages
          </label>
          <ComboboxChips className="aria-invalid:ring-destructive/20">
            <ComboboxValue>
              {(selectedValue: string[]) =>
                selectedValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              aria-invalid
              id="combobox-multi-invalid"
              placeholder="Pick at least two"
            />
          </ComboboxChips>
          <p className="text-sm text-destructive">
            Select at least two languages before submitting.
          </p>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No languages found.</ComboboxEmpty>
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
