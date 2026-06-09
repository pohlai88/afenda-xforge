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
} from "./autocomplete.shared";

const items = [
  { value: "frontend", label: "Frontend" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "platform", label: "Platform" },
];

function AutocompleteForm() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  return (
    <Autocomplete items={items}>
      <AutocompletePatternCard
        title="Form"
        description="The autocomplete can participate in a regular form submission."
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);
            setSubmitted(String(formData.get("team-role") ?? ""));
          }}
        >
          <label className="grid gap-2 text-sm font-medium" htmlFor="team-role">
            Role
            <AutocompleteInput
              id="team-role"
              name="team-role"
              placeholder="Choose a role"
            />
          </label>
          <AutocompleteContent>
            <AutocompleteEmpty>No role found.</AutocompleteEmpty>
            <AutocompleteList>
              {(item: (typeof items)[number]) => (
                <AutocompleteItem key={item.value} value={item}>
                  {item.label}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
          <button
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            type="submit"
          >
            Submit
          </button>
          {submitted ? (
            <p className="text-sm text-muted-foreground">
              Submitted value: {submitted}
            </p>
          ) : null}
        </form>
      </AutocompletePatternCard>
    </Autocomplete>
  );
}

export { AutocompleteForm };
