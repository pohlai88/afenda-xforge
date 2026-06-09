"use client";

import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePatternCard,
} from "./autocomplete.shared";

const items = [
  { value: "andorra", label: "Andorra" },
  { value: "berlin", label: "Berlin" },
  { value: "cairo", label: "Cairo" },
  { value: "dublin", label: "Dublin" },
];

function AutocompleteWithClearButton() {
  return (
    <Autocomplete items={items}>
      <AutocompletePatternCard
        title="With Clear Button"
        description="Users can clear the current query without leaving the field."
      >
        <AutocompleteInputGroup>
          <AutocompleteInput grouped placeholder="Search cities..." />
          <AutocompleteClear />
        </AutocompleteInputGroup>
        <AutocompleteContent>
          <AutocompleteEmpty>No results.</AutocompleteEmpty>
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

export { AutocompleteWithClearButton };
