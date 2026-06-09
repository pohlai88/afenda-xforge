"use client";

import * as React from "react";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui-shadcn/table";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

type Row = {
  id: string;
  title: string;
  status: "active" | "paused" | "draft";
  owner: string;
  region: "na" | "emea" | "apac";
  priority: "high" | "medium" | "low";
};

const rows: Row[] = [
  {
    id: "001",
    title: "Aurora launch",
    status: "active",
    owner: "Maya Chen",
    region: "apac",
    priority: "high",
  },
  {
    id: "002",
    title: "Northstar sprint",
    status: "paused",
    owner: "Jules Rivera",
    region: "emea",
    priority: "medium",
  },
  {
    id: "003",
    title: "Atlas review",
    status: "draft",
    owner: "Noah Patel",
    region: "na",
    priority: "low",
  },
  {
    id: "004",
    title: "Helix campaign",
    status: "active",
    owner: "Ava Brooks",
    region: "apac",
    priority: "medium",
  },
];

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
    key: "owner",
    label: "Owner",
    type: "text",
    placeholder: "Filter by owner",
  },
  {
    key: "region",
    label: "Region",
    type: "multiselect",
    options: [
      { value: "na", label: "NA" },
      { value: "emea", label: "EMEA" },
      { value: "apac", label: "APAC" },
    ],
  },
];

function matchesFilter(row: Row, filter: Filter) {
  const value = row[filter.field as keyof Row];
  const first = filter.values[0];

  if (filter.field === "region" && filter.operator === "is_any_of") {
    return filter.values.map(String).includes(String(value));
  }

  if (filter.operator === "contains") {
    return String(value)
      .toLowerCase()
      .includes(String(first ?? "").toLowerCase());
  }

  return String(value) === String(first ?? "");
}

export function FiltersDataGrid() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) =>
      filters.every((filter) => matchesFilter(row, filter)),
    );
  }, [filters]);

  return (
    <FiltersPatternCard
      title="Data Grid"
      description="Use filters to drive a records table and keep the toolbar in sync."
    >
      <div className="grid gap-4">
        <Filters filters={filters} fields={fields} onChange={setFilters} />
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filteredRows.length} results</Badge>
          <Button variant="outline" size="sm" onClick={() => setFilters([])}>
            Reset
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Region</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>{row.region}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FiltersPatternCard>
  );
}
