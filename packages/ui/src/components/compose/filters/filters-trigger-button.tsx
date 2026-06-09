"use client";

import { Filter as FilterIcon, SlidersHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "../../ui-shadcn/button";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "billing", label: "Billing" },
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering" },
    ],
  },
  {
    key: "assignee",
    label: "Assignee",
    type: "text",
    placeholder: "Filter by person",
  },
];

export function FiltersTriggerButton() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  return (
    <FiltersPatternCard
      title="Trigger Button"
      description="Use a custom trigger when the filter bar needs to fit inside a toolbar."
    >
      <Filters
        filters={filters}
        fields={fields}
        onChange={setFilters}
        trigger={
          <Button variant="secondary" className="gap-2">
            <SlidersHorizontal data-icon="inline-start" />
            Filter
            <FilterIcon data-icon="inline-end" />
          </Button>
        }
      />
    </FiltersPatternCard>
  );
}
