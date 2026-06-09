"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxPatternCard,
  ComboboxSeparator,
} from "./combobox.shared";

const groups = [
  {
    label: "Fruits",
    items: ["Apple", "Banana", "Orange"],
  },
  {
    label: "Berries",
    items: ["Blueberry", "Raspberry", "Strawberry"],
  },
];

export function ComboboxWithGroupsAndSeparators() {
  return (
    <Combobox
      items={groups.flatMap((group) => group.items)}
      defaultValue="Orange"
    >
      <ComboboxPatternCard
        description="Dividers visually separate each group in the popup."
        title="A combobox with grouped options and separators"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="combobox-group-separators"
          >
            Select fruit
          </label>
          <ComboboxInput
            id="combobox-group-separators"
            placeholder="Try Orange"
          />
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No matches.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxGroup className="grid gap-1">
              <ComboboxLabel>{groups[0].label}</ComboboxLabel>
              {groups[0].items.map((item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
            <ComboboxSeparator />
            <ComboboxGroup className="grid gap-1">
              <ComboboxLabel>{groups[1].label}</ComboboxLabel>
              {groups[1].items.map((item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPatternCard>
    </Combobox>
  );
}
