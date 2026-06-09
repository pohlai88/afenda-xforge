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
  { value: "feature", label: "Feature" },
  { value: "fix", label: "Fix" },
  { value: "docs", label: "Docs" },
  { value: "internal", label: "Internal" },
];

function AutocompleteAutoHighlight() {
  return (
    <Autocomplete items={items} autoHighlight>
      <AutocompletePatternCard
        title="Auto Highlight"
        description="The first match is highlighted as soon as the user types."
      >
        <AutocompleteInput placeholder="Search tags..." />
        <AutocompleteContent>
          <AutocompleteEmpty>No matches.</AutocompleteEmpty>
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

export { AutocompleteAutoHighlight };
