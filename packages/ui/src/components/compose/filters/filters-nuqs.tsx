"use client";

import * as React from "react";

import { Badge } from "../../ui-shadcn/badge";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

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

function decodeFilters(params: URLSearchParams) {
  const next: Filter[] = [];
  const status = params.get("status");
  const region = params.get("region");

  if (status) {
    next.push({
      id: `status-${status}`,
      field: "status",
      operator: "is",
      values: [status],
    });
  }

  if (region) {
    next.push({
      id: `region-${region}`,
      field: "region",
      operator: "is",
      values: [region],
    });
  }

  return next;
}

function encodeFilters(filters: Filter[]) {
  const params = new URLSearchParams();

  for (const filter of filters) {
    if (filter.values[0]) {
      params.set(filter.field, String(filter.values[0]));
    }
  }

  return params;
}

export function FiltersNuqs() {
  const [filters, setFilters] = React.useState<Filter[]>([]);
  const [queryString, setQueryString] = React.useState("");

  React.useEffect(() => {
    const search = window.location.search;
    setFilters(decodeFilters(new URLSearchParams(search)));
    setQueryString(search || "?");
  }, []);

  React.useEffect(() => {
    const params = encodeFilters(filters);
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
    setQueryString(query ? `?${query}` : "?");
  }, [filters]);

  return (
    <FiltersPatternCard
      title="Nuqs"
      description="Keep active filters mirrored in the browser URL."
    >
      <div className="grid gap-4">
        <Filters filters={filters} fields={fields} onChange={setFilters} />
        <Badge variant="outline" className="w-fit">
          {queryString || "?status=active"}
        </Badge>
      </div>
    </FiltersPatternCard>
  );
}
