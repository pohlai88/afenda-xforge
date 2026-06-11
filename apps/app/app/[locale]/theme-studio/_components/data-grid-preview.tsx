"use client";

import type { ErpVisualLaneId } from "@repo/design-system";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  LANE_DOT_CLASS,
  LANE_PILL_CLASS,
  LANE_PREVIEW_LABELS,
} from "./theme-studio-lane-tokens.ts";
import {
  PREVIEW_PANEL_CLASS,
  PreviewHeader,
  PreviewPageShell,
  ValidationNote,
} from "./theme-studio-shared.tsx";

type GridDensity = "compact" | "comfortable" | "default";

type RecordStatus = "Active" | "Blocked" | "Pending" | "Review";

type RiskLevel = "High" | "Low" | "Medium";

type CustomerRow = {
  company: string;
  id: string;
  lane: ErpVisualLaneId;
  lastActivity: string;
  owner: string;
  risk: RiskLevel;
  status: RecordStatus;
  value: string;
};

type FilterId =
  | "all"
  | "active"
  | "blocked"
  | "high-risk"
  | "pending"
  | "recent";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All records" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending approval" },
  { id: "blocked", label: "Blocked" },
  { id: "high-risk", label: "High risk" },
  { id: "recent", label: "Recently updated" },
];

const STATUS_BADGE: Record<
  RecordStatus,
  "success-light" | "warning-light" | "destructive-light" | "info-light"
> = {
  Active: "success-light",
  Pending: "warning-light",
  Blocked: "destructive-light",
  Review: "info-light",
};

const RISK_TEXT: Record<RiskLevel, string> = {
  Low: "text-success-muted-foreground",
  Medium: "text-warning-muted-foreground",
  High: "text-destructive-muted-foreground",
};

const SEED_ROWS: CustomerRow[] = [
  {
    id: "CUS-10021",
    company: "Green Valley Retail Group",
    lane: "customer",
    owner: "Sales",
    value: "$284,000",
    risk: "Low",
    status: "Active",
    lastActivity: "2 hours ago",
  },
  {
    id: "CUS-10022",
    company: "Northline Manufacturing",
    lane: "operations",
    owner: "Operations",
    value: "$142,500",
    risk: "Medium",
    status: "Review",
    lastActivity: "5 hours ago",
  },
  {
    id: "CUS-10023",
    company: "Everfield Distribution",
    lane: "goods",
    owner: "Inventory",
    value: "$78,900",
    risk: "High",
    status: "Blocked",
    lastActivity: "Yesterday",
  },
  {
    id: "CUS-10024",
    company: "Bright Harvest Foods",
    lane: "money",
    owner: "Finance",
    value: "$356,200",
    risk: "Medium",
    status: "Pending",
    lastActivity: "Yesterday",
  },
  {
    id: "CUS-10025",
    company: "PeopleFirst Services",
    lane: "people",
    owner: "HR",
    value: "$48,700",
    risk: "Low",
    status: "Active",
    lastActivity: "2 days ago",
  },
  {
    id: "CUS-10026",
    company: "AuditBridge Partners",
    lane: "governance",
    owner: "Governance",
    value: "$96,300",
    risk: "Medium",
    status: "Review",
    lastActivity: "3 days ago",
  },
  {
    id: "CUS-10027",
    company: "Lynx Evidence Labs",
    lane: "intelligence",
    owner: "Nexus",
    value: "$188,000",
    risk: "Low",
    status: "Active",
    lastActivity: "4 days ago",
  },
];

const TOTAL_RECORDS = 12_840;

type MetricTone = "destructive" | "primary" | "success" | "warning";

const METRIC_CARDS: {
  note: string;
  title: string;
  tone: MetricTone;
  value: string;
}[] = [
  {
    title: "Total records",
    value: "12,840",
    note: "+420 this month",
    tone: "primary",
  },
  {
    title: "Pending review",
    value: "384",
    note: "Requires attention",
    tone: "warning",
  },
  {
    title: "Blocked",
    value: "27",
    note: "Action required",
    tone: "destructive",
  },
  {
    title: "Healthy",
    value: "96.4%",
    note: "Operationally clear",
    tone: "success",
  },
];

const METRIC_BADGE_VARIANT: Record<
  MetricTone,
  "destructive-light" | "primary-light" | "success-light" | "warning-light"
> = {
  primary: "primary-light",
  success: "success-light",
  warning: "warning-light",
  destructive: "destructive-light",
};

function buildDenseRows(count: number): CustomerRow[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = SEED_ROWS[index % SEED_ROWS.length];
    if (!seed) {
      throw new Error("Seed rows must not be empty");
    }

    return {
      ...seed,
      id: `CUS-${(10_021 + index).toString()}`,
      company:
        index < SEED_ROWS.length
          ? seed.company
          : `${seed.company.replace(/\s#\d+$/, "")} · Batch ${Math.floor(index / SEED_ROWS.length) + 1}`,
    };
  });
}

const ALL_ROWS = buildDenseRows(100);

function matchesFilter(row: CustomerRow, filter: FilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "active":
      return row.status === "Active";
    case "pending":
      return row.status === "Pending";
    case "blocked":
      return row.status === "Blocked";
    case "high-risk":
      return row.risk === "High";
    case "recent":
      return (
        row.lastActivity.includes("hour") || row.lastActivity === "Yesterday"
      );
    default:
      return true;
  }
}

export function DataGridPreview(): ReactElement {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [density, setDensity] = useState<GridDensity>("default");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(["CUS-10021", "CUS-10024"])
  );

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ALL_ROWS.filter((row) => {
      if (!matchesFilter(row, activeFilter)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        row.company.toLowerCase().includes(normalizedQuery) ||
        row.owner.toLowerCase().includes(normalizedQuery) ||
        row.id.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeFilter, query]);

  const densityAttr =
    density === "default" ? undefined : ({ "data-density": density } as const);

  const toggleRow = (id: string, checked: boolean): void => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAllVisible = (checked: boolean): void => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const row of visibleRows) {
        if (checked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  };

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedIds.has(row.id));
  const someVisibleSelected =
    visibleRows.some((row) => selectedIds.has(row.id)) && !allVisibleSelected;

  return (
    <PreviewPageShell>
      <PreviewHeader
        description="Long-hour ERP readability: 100 dense rows, filters, lane dots, status chips, row actions, and neutral focus rings — 25% Theme Studio score weight."
        previewNumber="02"
        scores={[
          { label: "Readability", value: 94 },
          { label: "Status clarity", value: 96 },
          { label: "Lane distinction", value: 91 },
        ]}
        title="Data Grid Preview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {METRIC_CARDS.map((item) => (
          <Card className="shadow-sm" key={item.title}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardDescription className="text-sm">
                  {item.title}
                </CardDescription>
                <Badge size="sm" variant={METRIC_BADGE_VARIANT[item.tone]}>
                  {item.note}
                </Badge>
              </div>
              <CardTitle className="text-3xl text-tabular tracking-tight">
                {item.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden shadow-sm" {...densityAttr}>
        <CardHeader className="border-border border-b">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Customer operating records</CardTitle>
              <CardDescription>
                Scroll 100 rows — hover, selection, badges, and actions under
                dense conditions.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                className="control-density sm:w-72"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company, owner, ID..."
                value={query}
              />
              <Button
                className="control-density"
                type="button"
                variant="outline"
              >
                Export
              </Button>
              <Button className="control-density" type="button">
                New record
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                size="sm"
                type="button"
                variant={activeFilter === filter.id ? "secondary" : "outline"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="min-w-0 p-0">
          <ScrollArea className="h-[34rem] w-full">
            <table
              className="w-full min-w-[1040px] caption-bottom text-sm"
              data-slot="table"
            >
              <TableHeader className="sticky top-0 z-10 bg-muted/50 [&_tr]:border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all visible records"
                      checked={
                        allVisibleSelected
                          ? true
                          : someVisibleSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) =>
                        toggleAllVisible(checked === true)
                      }
                    />
                  </TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Lane</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead className="text-end">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      className="h-32 text-center text-muted-foreground"
                      colSpan={9}
                    >
                      No records match the current filter or search.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((row) => (
                    <TableRow
                      className={cn(
                        "row-density",
                        selectedIds.has(row.id) && "bg-muted/50"
                      )}
                      data-state={
                        selectedIds.has(row.id) ? "selected" : undefined
                      }
                      key={row.id}
                    >
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${row.company}`}
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={(checked) =>
                            toggleRow(row.id, checked === true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "size-2.5 shrink-0 rounded-full",
                              LANE_DOT_CLASS[row.lane]
                            )}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {row.company}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {row.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize",
                            LANE_PILL_CLASS[row.lane]
                          )}
                          size="sm"
                          variant="outline"
                        >
                          {LANE_PREVIEW_LABELS[row.lane]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.owner}
                      </TableCell>
                      <TableCell className="font-medium text-tabular">
                        {row.value}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-medium text-xs",
                            RISK_TEXT[row.risk]
                          )}
                        >
                          {row.risk}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge size="sm" variant={STATUS_BADGE[row.status]}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.lastActivity}
                      </TableCell>
                      <TableCell className="text-end">
                        <RowActions company={row.company} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-border border-t sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {visibleRows.length} of {TOTAL_RECORDS.toLocaleString()}{" "}
            records · {selectedIds.size} selected
          </p>
          <div className="flex gap-2">
            <Button size="sm" type="button" variant="outline">
              Previous
            </Button>
            <Button size="sm" type="button" variant="outline">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Density preview</CardTitle>
            <CardDescription>
              Uses <code className="text-xs">data-density</code> tokens from
              globals.css — control and row heights update live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ["compact", "Compact", "Admin-heavy users"],
                ["default", "Default", "Balanced ERP usage"],
                ["comfortable", "Comfortable", "Review and approval"],
              ] as const
            ).map(([id, label, description]) => (
              <div
                className={cn(
                  "flex items-center justify-between border border-border bg-surface px-4 py-3",
                  PREVIEW_PANEL_CLASS
                )}
                key={id}
              >
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-muted-foreground text-xs">{description}</p>
                </div>
                <Button
                  onClick={() => setDensity(id)}
                  size="sm"
                  type="button"
                  variant={density === id ? "secondary" : "outline"}
                >
                  Preview
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Grid validation notes</CardTitle>
            <CardDescription>
              Page 2 exposes theme weaknesses that dashboards hide.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <ValidationNote
              description="Status chips must stay clear when many rows use different statuses."
              title="Badge overload"
            />
            <ValidationNote
              description="Lane dots and pills remain distinguishable in dense tables."
              title="Lane recognition"
            />
            <ValidationNote
              description="Search input uses neutral ring — brand reserved for primary CTAs."
              title="Focus visibility"
            />
            <ValidationNote
              description="Muted text, borders, and row hover must not cause visual fatigue."
              title="Long-hour comfort"
            />
          </CardContent>
        </Card>
      </section>
    </PreviewPageShell>
  );
}

function RowActions({ company }: { company: string }): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Review {company}</DropdownMenuItem>
        <DropdownMenuItem>Approve</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Block record</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
