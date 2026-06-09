"use client";

import * as React from "react";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { createFilter, Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
      { value: "draft", label: "Draft" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    type: "multiselect",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  {
    key: "owner",
    label: "Owner",
    type: "text",
    placeholder: "Search by owner name",
  },
];

export function FiltersBasic() {
  const [filters, setFilters] = React.useState<Filter[]>([
    createFilter("status", "is", ["active"]),
  ]);

  return (
    <FiltersPatternCard
      title="Filters"
      description="A flexible toolbar for simple record filtering."
    >
      <Filters filters={filters} fields={fields} onChange={setFilters} />
    </FiltersPatternCard>
  );
}
