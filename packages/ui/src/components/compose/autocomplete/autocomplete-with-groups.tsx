"use client";

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompletePatternCard,
} from "./autocomplete.shared";

const groups = [
  {
    value: "Fruits",
    items: ["Apple", "Banana", "Orange"],
  },
  {
    value: "Vegetables",
    items: ["Carrot", "Lettuce", "Spinach"],
  },
];

function AutocompleteWithGroups() {
  return (
    <Autocomplete items={groups}>
      <AutocompletePatternCard
        title="With Groups"
        description="Related options are grouped with headings inside the popup."
      >
        <AutocompleteInput placeholder="Select produce..." />
        <AutocompleteContent>
          <AutocompleteEmpty>No produce found.</AutocompleteEmpty>
          <AutocompleteList>
            {groups.map((group) => (
              <AutocompleteGroup key={group.value} items={group.items}>
                <AutocompleteLabel>{group.value}</AutocompleteLabel>
                <AutocompleteCollection>
                  {(item: string) => (
                    <AutocompleteItem key={item} value={item}>
                      {item}
                    </AutocompleteItem>
                  )}
                </AutocompleteCollection>
              </AutocompleteGroup>
            ))}
          </AutocompleteList>
        </AutocompleteContent>
      </AutocompletePatternCard>
    </Autocomplete>
  );
}

export { AutocompleteWithGroups };
