"use client";

import { CheckCircle2, CircleOff, CircleSlash } from "lucide-react";
import * as React from "react";

import { Button } from "../../ui-shadcn/button";
import { ToggleGroup, ToggleGroupItem } from "../../ui-shadcn/toggle-group";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "state",
    label: "State",
    type: "custom",
    customRenderer: ({ value, onChange, size }) => (
      <ToggleGroup
        type="single"
        value={String(value[0] ?? "open")}
        onValueChange={(nextValue) => onChange([nextValue as string])}
        variant="outline"
        size={size === "sm" ? "sm" : "default"}
        spacing={6}
        className="w-full justify-start"
      >
        <ToggleGroupItem value="open">
          <CheckCircle2 data-icon="inline-start" />
          Open
        </ToggleGroupItem>
        <ToggleGroupItem value="pending">
          <CircleSlash data-icon="inline-start" />
          Pending
        </ToggleGroupItem>
        <ToggleGroupItem value="closed">
          <CircleOff data-icon="inline-start" />
          Closed
        </ToggleGroupItem>
      </ToggleGroup>
    ),
    customValueRenderer: (values) => values.map(String).join(" · "),
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "p1", label: "P1" },
      { value: "p2", label: "P2" },
      { value: "p3", label: "P3" },
    ],
  },
];

export function FiltersCustomControls() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  return (
    <FiltersPatternCard
      title="Custom Controls"
      description="Swap the standard input for a custom control surface."
    >
      <Filters filters={filters} fields={fields} onChange={setFilters} />
      <div className="mt-4">
        <Button variant="outline" size="sm">
          Preview state
        </Button>
      </div>
    </FiltersPatternCard>
  );
}
