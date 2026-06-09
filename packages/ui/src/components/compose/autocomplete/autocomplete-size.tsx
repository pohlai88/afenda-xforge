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
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

function AutocompleteSize() {
  return (
    <AutocompletePatternCard
      title="Size"
      description="The same autocomplete can be presented at different input sizes."
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Small
          </span>
          <Autocomplete items={items}>
            <AutocompleteInput inputSize="sm" placeholder="Small input" />
            <AutocompleteContent>
              <AutocompleteEmpty>No options found.</AutocompleteEmpty>
              <AutocompleteList>
                {(item: (typeof items)[number]) => (
                  <AutocompleteItem key={item.value} value={item}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          </Autocomplete>
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Default
          </span>
          <Autocomplete items={items}>
            <AutocompleteInput placeholder="Default input" />
            <AutocompleteContent>
              <AutocompleteEmpty>No options found.</AutocompleteEmpty>
              <AutocompleteList>
                {(item: (typeof items)[number]) => (
                  <AutocompleteItem key={item.value} value={item}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          </Autocomplete>
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Large
          </span>
          <Autocomplete items={items}>
            <AutocompleteInput inputSize="lg" placeholder="Large input" />
            <AutocompleteContent>
              <AutocompleteEmpty>No options found.</AutocompleteEmpty>
              <AutocompleteList>
                {(item: (typeof items)[number]) => (
                  <AutocompleteItem key={item.value} value={item}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          </Autocomplete>
        </div>
      </div>
    </AutocompletePatternCard>
  );
}

export { AutocompleteSize };
