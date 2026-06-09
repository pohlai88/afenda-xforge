"use client";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePatternCard,
  AutocompleteTrigger,
} from "./autocomplete.shared";

const items = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
  { value: "omega", label: "Omega" },
];

function AutocompleteWithTriggerButton() {
  return (
    <Autocomplete items={items} openOnInputClick>
      <AutocompletePatternCard
        title="With Trigger Button"
        description="A trigger button opens the popup without relying only on typing."
      >
        <AutocompleteInputGroup>
          <AutocompleteInput grouped placeholder="Pick a value..." />
          <AutocompleteTrigger />
        </AutocompleteInputGroup>
        <AutocompleteContent>
          <AutocompleteEmpty>No values available.</AutocompleteEmpty>
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

export { AutocompleteWithTriggerButton };
