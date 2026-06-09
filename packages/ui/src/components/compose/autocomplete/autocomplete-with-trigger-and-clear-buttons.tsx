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
  AutocompleteTrigger,
} from "./autocomplete.shared";

const items = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

function AutocompleteWithTriggerAndClearButtons() {
  return (
    <Autocomplete items={items}>
      <AutocompletePatternCard
        title="With Trigger and Clear Buttons"
        description="This layout combines a manual trigger with a one-click reset."
      >
        <AutocompleteInputGroup>
          <AutocompleteInput grouped placeholder="Choose a cadence..." />
          <AutocompleteClear />
          <AutocompleteTrigger />
        </AutocompleteInputGroup>
        <AutocompleteContent>
          <AutocompleteEmpty>No cadence found.</AutocompleteEmpty>
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

export { AutocompleteWithTriggerAndClearButtons };
