"use client";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePatternCard,
} from "./autocomplete.shared";

const items = [
  { value: "amsterdam", label: "Amsterdam" },
  { value: "bangkok", label: "Bangkok" },
  { value: "lisbon", label: "Lisbon" },
  { value: "tokyo", label: "Tokyo" },
];

function AutocompleteWithLabel() {
  return (
    <Autocomplete items={items}>
      <AutocompletePatternCard
        title="With Label"
        description="A labeled field keeps the autocomplete accessible and scannable."
      >
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="autocomplete-with-label"
        >
          City
        </label>
        <AutocompleteInput
          id="autocomplete-with-label"
          placeholder="Select a city"
        />
        <AutocompleteContent>
          <AutocompleteEmpty>No city found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: (typeof items)[number]) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </AutocompletePatternCard>
    </Autocomplete>
  );
}

export { AutocompleteWithLabel };
