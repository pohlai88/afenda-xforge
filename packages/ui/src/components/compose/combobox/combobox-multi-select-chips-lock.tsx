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

export function ComboboxMultiSelectChipsLock() {
  return (
    <Combobox multiple items={languages} defaultValue={["TypeScript", "Go"]}>
      <ComboboxPatternCard
        description="Pinned chips stay visible and cannot be removed."
        title="A multi-select with chips that cannot be removed"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-multi-lock">
            Programming languages
          </label>
          <ComboboxChips>
            <ComboboxValue>
              {() => (
                <>
                  <ComboboxChip showRemove={false}>TypeScript</ComboboxChip>
                  <ComboboxChip showRemove={false}>Go</ComboboxChip>
                </>
              )}
            </ComboboxValue>
            <ComboboxChipsInput
              id="combobox-multi-lock"
              placeholder="Add more"
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
