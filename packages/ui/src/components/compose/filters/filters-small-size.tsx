"use client";

import * as React from "react";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "region",
    label: "Region",
    type: "select",
    options: [
      { value: "na", label: "NA" },
      { value: "emea", label: "EMEA" },
      { value: "apac", label: "APAC" },
    ],
  },
];

export function FiltersSmallSize() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  return (
    <FiltersPatternCard
      title="Small Size"
      description="A compact version for tight sidebars and toolbars."
    >
      <Filters
        size="sm"
        filters={filters}
        fields={fields}
        onChange={setFilters}
      />
    </FiltersPatternCard>
  );
}
