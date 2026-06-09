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
  { value: "billing", label: "Billing" },
  { value: "integrations", label: "Integrations" },
  { value: "notifications", label: "Notifications" },
  { value: "security", label: "Security" },
];

function AutocompleteDisabled() {
  return (
    <Autocomplete items={items} disabled>
      <AutocompletePatternCard
        title="Disabled"
        description="The field remains visible while interaction is blocked."
      >
        <AutocompleteInput placeholder="Search settings..." disabled />
        <AutocompleteContent>
          <AutocompleteEmpty>No results found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: (typeof items)[number]) => (
              <AutocompleteItem key={item.value} value={item} disabled>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </AutocompletePatternCard>
    </Autocomplete>
  );
}

export { AutocompleteDisabled };
