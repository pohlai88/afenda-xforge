"use client";

import * as React from "react";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "department",
    label: "Department",
    type: "select",
    options: [
      { value: "product", label: "Product" },
      { value: "finance", label: "Finance" },
      { value: "ops", label: "Operations" },
      { value: "growth", label: "Growth" },
    ],
  },
  {
    key: "search",
    label: "Search text",
    type: "text",
    placeholder: "Search long content",
  },
];

export function FiltersLargeSize() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  return (
    <FiltersPatternCard
      title="Large Size"
      description="A roomier density for focused filtering experiences."
    >
      <Filters
        size="lg"
        filters={filters}
        fields={fields}
        onChange={setFilters}
      />
    </FiltersPatternCard>
  );
}
