"use client";

import * as React from "react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePatternCard,
  AutocompleteStatus,
} from "./autocomplete.shared";

const movies = [
  "Arrival",
  "Blade Runner 2049",
  "Dune",
  "Everything Everywhere All at Once",
  "Her",
  "Interstellar",
  "Past Lives",
  "The Creator",
];

function AutocompleteAsyncSearch() {
  const [value, setValue] = React.useState("");
  const [items, setItems] = React.useState<string[]>(movies);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);

    const timeout = window.setTimeout(() => {
      const query = value.trim().toLowerCase();
      setItems(movies.filter((movie) => movie.toLowerCase().includes(query)));
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [value]);

  return (
    <Autocomplete
      items={items}
      mode="none"
      value={value}
      onValueChange={setValue}
    >
      <AutocompletePatternCard
        title="Async Search"
        description="Results are updated from an async source while typing."
      >
        <AutocompleteInput placeholder="Search movies..." />
        <AutocompleteContent>
          <AutocompleteStatus>
            {loading ? "Searching..." : `${items.length} results`}
          </AutocompleteStatus>
          <AutocompleteEmpty>No matches.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </AutocompletePatternCard>
    </Autocomplete>
  );
}

export { AutocompleteAsyncSearch };
