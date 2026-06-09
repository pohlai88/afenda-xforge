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

const languages = [
  "TypeScript",
  "JavaScript",
  "Rust",
  "Go",
  "Python",
  "Ruby",
  "Swift",
];

export function ComboboxMultiSelect() {
  return (
    <Combobox multiple items={languages} defaultValue={["TypeScript", "Go"]}>
      <ComboboxPatternCard
        description="Multiple selections are rendered as removable chips."
        title="A multi-select combobox"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="combobox-multi-select"
          >
            Programming languages
          </label>
          <ComboboxChips>
            <ComboboxValue>
              {(selectedValue: string[]) =>
                selectedValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              id="combobox-multi-select"
              placeholder="e.g. TypeScript"
            />
          </ComboboxChips>
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
