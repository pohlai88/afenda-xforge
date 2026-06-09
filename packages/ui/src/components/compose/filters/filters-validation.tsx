"use client";

import * as React from "react";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "ticket",
    label: "Ticket ID",
    type: "text",
    placeholder: "e.g. INC-1042",
    pattern: "^[A-Z]{3}-\\d{4}$",
    validation: (value) => {
      const input = String(value[0] ?? "");
      return {
        valid: /^[A-Z]{3}-\d{4}$/.test(input),
        message: "Use the INC-1234 format.",
      };
    },
  },
  {
    key: "score",
    label: "Score",
    type: "select",
    options: [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
    ],
    validation: (value) => {
      const score = Number(value[0] ?? 0);
      return score >= 1 && score <= 5;
    },
  },
];

export function FiltersValidation() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  return (
    <FiltersPatternCard
      title="Validation"
      description="Prevent bad values before they are added to the filter bar."
    >
      <Filters filters={filters} fields={fields} onChange={setFilters} />
    </FiltersPatternCard>
  );
}
