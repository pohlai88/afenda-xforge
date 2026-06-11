"use client";

import type { ErpVisualLaneId } from "@repo/design-system";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@repo/ui";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { SearchIcon } from "lucide-react";
import type { CSSProperties, ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  ERP_VISUAL_LANE_ORDER,
  LANE_DOT_CLASS,
  LANE_PILL_CLASS,
  LANE_SOLID_CLASS,
  LANE_SYSTEM_DESCRIPTION,
  LANE_SYSTEM_MODULES,
  LANE_SYSTEM_TITLE,
} from "./theme-studio-lane-tokens.ts";
import {
  PREVIEW_PANEL_CLASS,
  PreviewHeader,
  PreviewPageShell,
  SEMANTIC_TONE_BADGE,
  ValidationNote,
  type SemanticTone,
} from "./theme-studio-shared.tsx";

type ModuleItem = {
  count: string;
  description: string;
  id: string;
  label: string;
  lane: ErpVisualLaneId;
};

type NavigationGroup = {
  modules: ModuleItem[];
  title: string;
};

const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    title: "Finance & Control",
    modules: [
      {
        id: "finance.general-ledger",
        label: "General Ledger",
        description: "Journal, posting, trial balance",
        lane: "money",
        count: "18",
      },
      {
        id: "finance.accounts-payable",
        label: "Accounts Payable",
        description: "Supplier invoices and payments",
        lane: "money",
        count: "42",
      },
      {
        id: "finance.cashflow",
        label: "Cashflow Control",
        description: "Liquidity and forecast monitoring",
        lane: "money",
        count: "7",
      },
    ],
  },
  {
    title: "People Operations",
    modules: [
      {
        id: "hr.employee-records",
        label: "Employee Records",
        description: "Profiles, documents, lifecycle",
        lane: "people",
        count: "320",
      },
      {
        id: "hr.payroll",
        label: "Payroll",
        description: "Payroll periods and statutory checks",
        lane: "people",
        count: "12",
      },
    ],
  },
  {
    title: "Supply Chain",
    modules: [
      {
        id: "inventory.stock-control",
        label: "Stock Control",
        description: "Lots, movement, available quantity",
        lane: "goods",
        count: "1.8k",
      },
      {
        id: "production.work-orders",
        label: "Work Orders",
        description: "Production execution and output",
        lane: "operations",
        count: "64",
      },
      {
        id: "sales.customer-orders",
        label: "Customer Orders",
        description: "Sales orders and fulfillment",
        lane: "customer",
        count: "91",
      },
    ],
  },
  {
    title: "Governance & Intelligence",
    modules: [
      {
        id: "system-admin.audit-viewer",
        label: "Audit Viewer",
        description: "Evidence, actions, and traceability",
        lane: "governance",
        count: "2.4k",
      },
      {
        id: "nexus.enterprise-search",
        label: "Nexus Search",
        description: "Ask, prove, decide, and act",
        lane: "intelligence",
        count: "128",
      },
    ],
  },
];

const ALL_MODULES = NAVIGATION_GROUPS.flatMap((group) => group.modules);

const MAPPING_ROWS = [
  {
    module: "Payroll",
    currentLane: "People",
    targetLane: "People",
    tone: "success" as const satisfies SemanticTone,
  },
  {
    module: "Purchase Orders",
    currentLane: "Goods",
    targetLane: "Goods",
    tone: "success" as const satisfies SemanticTone,
  },
  {
    module: "Customer Credit Hold",
    currentLane: "Customer",
    targetLane: "Money",
    tone: "warning" as const satisfies SemanticTone,
  },
  {
    module: "Audit Evidence Search",
    currentLane: "Governance",
    targetLane: "Intelligence",
    tone: "info" as const satisfies SemanticTone,
  },
];

const MAPPING_LABEL: Record<SemanticTone, string> = {
  success: "Safe",
  warning: "Review",
  info: "Informational",
  destructive: "Blocked",
};

export function ErpNavigationPreview(): ReactElement {
  const [activeModuleId, setActiveModuleId] = useState(
    "finance.general-ledger"
  );
  const [commandQuery, setCommandQuery] = useState("");
  const [railCollapsed, setRailCollapsed] = useState(false);

  const filteredGroups = useMemo(() => {
    const normalized = commandQuery.trim().toLowerCase();
    if (!normalized) {
      return NAVIGATION_GROUPS;
    }

    return NAVIGATION_GROUPS.map((group) => ({
      ...group,
      modules: group.modules.filter(
        (module) =>
          module.label.toLowerCase().includes(normalized) ||
          module.description.toLowerCase().includes(normalized) ||
          module.id.toLowerCase().includes(normalized)
      ),
    })).filter((group) => group.modules.length > 0);
  }, [commandQuery]);

  const sidebarWidth = railCollapsed ? "5rem" : "18rem";

  return (
    <PreviewPageShell>
      <PreviewHeader
        actions={
          <Button
            onClick={() => setRailCollapsed((current) => !current)}
            size="sm"
            type="button"
            variant="outline"
          >
            {railCollapsed ? "Expand sidebar rail" : "Collapse sidebar rail"}
          </Button>
        }
        description="Validates tenant module customization and lane colors across sidebar navigation, grouped modules, active states, collapsed rail, and command entry — where tenants first understand how colors organize their ERP."
        previewNumber="04"
        scores={[
          { label: "Lane recognition", value: 94 },
          { label: "Active state clarity", value: 92 },
          { label: "Navigation comfort", value: 95 },
        ]}
        title="ERP Navigation Preview"
      />

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
        <SidebarProvider
          className="min-h-0 w-full items-start"
          style={{ "--sidebar-width": sidebarWidth } as CSSProperties}
        >
          <Card
            className={cn(
              "min-w-0 overflow-hidden shadow-sm transition-[width]",
              railCollapsed ? "w-20" : "w-full xl:w-72"
            )}
          >
            <Sidebar collapsible="none" className="w-full border-0">
              <SidebarHeader className="border-sidebar-border border-b p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-lg bg-primary font-black text-primary-foreground text-sm shadow-sm"
                    )}
                  >
                    XF
                  </div>
                  {!railCollapsed ? (
                    <div className="min-w-0">
                      <p className="font-semibold text-sidebar-foreground text-sm">
                        XForge ERP
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Tenant: Vietnam Feed
                      </p>
                    </div>
                  ) : null}
                </div>

                {!railCollapsed ? (
                  <div className="relative mt-4">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="control-density border-sidebar-border bg-background pl-9"
                      onChange={(event) => setCommandQuery(event.target.value)}
                      placeholder="Search modules / command..."
                      value={commandQuery}
                    />
                  </div>
                ) : null}
              </SidebarHeader>

              <SidebarContent>
                <ScrollArea className={railCollapsed ? "h-[28rem]" : "h-[32rem]"}>
                  {railCollapsed ? (
                    <SidebarGroup className="p-2">
                      <SidebarMenu>
                        {ERP_VISUAL_LANE_ORDER.map((lane) => {
                          const module = ALL_MODULES.find(
                            (item) => item.lane === lane
                          );
                          if (!module) {
                            return null;
                          }

                          return (
                            <SidebarMenuItem key={lane}>
                              <SidebarMenuButton
                                className={cn(
                                  "mx-auto size-12 justify-center p-0",
                                  LANE_SOLID_CLASS[lane],
                                  activeModuleId === module.id &&
                                    "ring-2 ring-sidebar-ring ring-offset-2 ring-offset-sidebar"
                                )}
                                onClick={() => setActiveModuleId(module.id)}
                                size="lg"
                                tooltip={LANE_SYSTEM_TITLE[lane]}
                              >
                                <span className="font-black text-xs uppercase">
                                  {LANE_SYSTEM_TITLE[lane].slice(0, 2)}
                                </span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroup>
                  ) : filteredGroups.length === 0 ? (
                    <p className="p-4 text-center text-muted-foreground text-sm">
                      No modules match your search.
                    </p>
                  ) : (
                    filteredGroups.map((group) => (
                      <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {group.modules.map((module) => (
                              <SidebarModuleItem
                                active={activeModuleId === module.id}
                                key={module.id}
                                module={module}
                                onSelect={() => setActiveModuleId(module.id)}
                              />
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    ))
                  )}
                </ScrollArea>
              </SidebarContent>
            </Sidebar>
          </Card>
        </SidebarProvider>

        <section className="grid min-w-0 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>Module navigation map</CardTitle>
                  <CardDescription>
                    Tenants should instantly understand which module belongs to
                    which ERP lane.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="control-density"
                    type="button"
                    variant="outline"
                  >
                    Reset mapping
                  </Button>
                  <Button className="control-density" type="button">
                    Save tenant mapping
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              {NAVIGATION_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    {group.title}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {group.modules.map((module) => (
                      <ModuleCard
                        active={activeModuleId === module.id}
                        key={module.id}
                        module={module}
                        onSelect={() => setActiveModuleId(module.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Lane system overview</CardTitle>
              <CardDescription>
                Seven visual lanes cover 50+ ERP modules without turning the
                application into a rainbow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {ERP_VISUAL_LANE_ORDER.map((lane) => (
                <LaneOverview key={lane} lane={lane} />
              ))}
            </CardContent>
          </Card>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tenant module customization</CardTitle>
            <CardDescription>
              How a tenant reviews module-to-lane assignment before publishing
              the theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {MAPPING_ROWS.map((row) => (
              <MappingRow key={row.module} row={row} />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Collapsed rail preview</CardTitle>
                <CardDescription>
                  Small icon rails are where weak lane colors become obvious.
                </CardDescription>
              </div>
              <Button
                onClick={() => setRailCollapsed((current) => !current)}
                size="sm"
                type="button"
                variant="outline"
              >
                {railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border border-border bg-sidebar p-4",
                PREVIEW_PANEL_CLASS
              )}
            >
              <div className="flex flex-wrap gap-3">
                {ERP_VISUAL_LANE_ORDER.map((lane) => (
                  <button
                    className={cn(
                      "grid size-14 place-items-center rounded-lg font-black text-xs uppercase shadow-sm",
                      LANE_SOLID_CLASS[lane]
                    )}
                    key={lane}
                    onClick={() => {
                      const module = ALL_MODULES.find((item) => item.lane === lane);
                      if (module) {
                        setActiveModuleId(module.id);
                      }
                    }}
                    title={LANE_SYSTEM_TITLE[lane]}
                    type="button"
                  >
                    {LANE_SYSTEM_TITLE[lane].slice(0, 2)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <ValidationNote
                description="Lane colors must remain recognizable as dots, initials, and compact icons."
                title="Tiny-state clarity"
              />
              <ValidationNote
                description="Lane colors should not look like success, warning, error, or info states."
                title="No status confusion"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Navigation preview validation notes</CardTitle>
          <CardDescription>
            Page 4 confirms the theme is usable for module discovery and daily
            ERP movement, not just dashboard presentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ValidationNote
            description="Users must understand module category before reading the full module name."
            title="Module discoverability"
          />
          <ValidationNote
            description="The same lane color must mean the same business area across all pages."
            title="Lane consistency"
          />
          <ValidationNote
            description="Selected module state should be obvious without becoming visually aggressive."
            title="Active navigation"
          />
          <ValidationNote
            description="Tenants can remap modules, but lane semantics must stay controlled."
            title="Tenant flexibility"
          />
        </CardContent>
      </Card>
    </PreviewPageShell>
  );
}

function SidebarModuleItem({
  active,
  module,
  onSelect,
}: {
  active: boolean;
  module: ModuleItem;
  onSelect: () => void;
}): ReactElement {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-auto items-start py-2.5"
        isActive={active}
        onClick={onSelect}
        size="lg"
        tooltip={module.label}
      >
        <span
          aria-hidden
          className={cn("size-2.5 shrink-0 rounded-full", LANE_DOT_CLASS[module.lane])}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
          <span className="truncate font-medium leading-tight">
            {module.label}
          </span>
          <span className="truncate text-muted-foreground text-xs leading-snug">
            {module.description}
          </span>
        </span>
        <Badge className="shrink-0" size="sm" variant="outline">
          {module.count}
        </Badge>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ModuleCard({
  active,
  module,
  onSelect,
}: {
  active: boolean;
  module: ModuleItem;
  onSelect: () => void;
}): ReactElement {
  return (
    <button
      className={cn(
        "border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
        PREVIEW_PANEL_CLASS,
        active ? LANE_PILL_CLASS[module.lane] : "border-border"
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-10 place-items-center rounded-lg font-black text-xs uppercase",
              LANE_SOLID_CLASS[module.lane]
            )}
          >
            {module.label.slice(0, 2)}
          </span>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-sm">{module.label}</h3>
            <p className="mt-1 truncate text-muted-foreground text-xs">
              {module.id}
            </p>
          </div>
        </div>

        {active ? (
          <Badge className="shrink-0" size="sm" variant="primary-light">
            Active
          </Badge>
        ) : null}
      </div>

      <p className="mt-4 text-muted-foreground text-sm leading-6">
        {module.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-border border-t pt-3">
        <Badge
          className={cn("capitalize", LANE_PILL_CLASS[module.lane])}
          size="sm"
          variant="outline"
        >
          {module.lane}
        </Badge>
        <span className="text-muted-foreground text-xs">
          {module.count} items
        </span>
      </div>
    </button>
  );
}

function LaneOverview({ lane }: { lane: ErpVisualLaneId }): ReactElement {
  return (
    <div className={cn("border p-4", PREVIEW_PANEL_CLASS, LANE_PILL_CLASS[lane])}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn("size-3 shrink-0 rounded-full", LANE_DOT_CLASS[lane])}
        />
        <h3 className="font-semibold text-sm">{LANE_SYSTEM_TITLE[lane]}</h3>
      </div>
      <p className="mt-3 font-semibold text-xs">{LANE_SYSTEM_MODULES[lane]}</p>
      <p className="mt-2 text-muted-foreground text-xs leading-5">
        {LANE_SYSTEM_DESCRIPTION[lane]}
      </p>
    </div>
  );
}

function MappingRow({
  row,
}: {
  row: (typeof MAPPING_ROWS)[number];
}): ReactElement {
  return (
    <div
      className={cn(
        "grid gap-3 border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto] md:items-center",
        PREVIEW_PANEL_CLASS
      )}
    >
      <div>
        <h3 className="font-semibold text-sm">{row.module}</h3>
        <p className="mt-1 text-muted-foreground text-xs">Tenant mapping preview</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Badge size="sm" variant="outline">
          {row.currentLane}
        </Badge>
        <span className="text-muted-foreground">→</span>
        <Badge size="sm" variant="secondary">
          {row.targetLane}
        </Badge>
      </div>

      <Badge size="sm" variant={SEMANTIC_TONE_BADGE[row.tone]}>
        {MAPPING_LABEL[row.tone]}
      </Badge>
    </div>
  );
}
