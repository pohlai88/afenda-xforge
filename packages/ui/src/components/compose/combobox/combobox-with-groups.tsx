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
} from "./combobox.shared";

const groups = [
  {
    label: "Fruits",
    items: ["Apple", "Banana", "Orange"],
  },
  {
    label: "Vegetables",
    items: ["Carrot", "Lettuce", "Spinach"],
  },
];

export function ComboboxWithGroups() {
  return (
    <Combobox
      items={groups.flatMap((group) => group.items)}
      defaultValue="Apple"
    >
      <ComboboxPatternCard
        description="Related options are grouped under section headings."
        title="A combobox with grouped options"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-groups">
            Select produce
          </label>
          <ComboboxInput id="combobox-groups" placeholder="e.g. Mango" />
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxGroup className="grid gap-1">
              <ComboboxLabel>{groups[0].label}</ComboboxLabel>
              {groups[0].items.map((item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
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
