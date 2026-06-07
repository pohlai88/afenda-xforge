import type {
  DashboardKpiDefinition,
  DashboardModuleHealth,
  DashboardTableRow,
  EntityMetadata,
} from "@repo/metadata";

const REFERENCE_TIME = new Date("2026-06-07T12:00:00Z").getTime();

const hoursAgo = (hours: number): Date =>
  new Date(REFERENCE_TIME - hours * 60 * 60 * 1000);

const daysAgo = (days: number): Date =>
  new Date(REFERENCE_TIME - days * 24 * 60 * 60 * 1000);

export const customerMetadata: EntityMetadata = {
  entity: "customer",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  table: {
    defaultSort: "lastActivityAt",
    columns: [
      { key: "name", label: "Customer" },
      { key: "segment", label: "Segment" },
      { key: "status", label: "Status", kind: "status" },
      { key: "email", label: "Email", kind: "email" },
      { key: "owner", label: "Owner" },
      { key: "lastActivityAt", label: "Last activity" },
    ],
  },
};

export const customerRows: readonly DashboardTableRow[] = [
  {
    id: "cust-001",
    name: "Lumo Retail Group",
    segment: "Enterprise",
    status: "active",
    email: "finance@lumo.example",
    owner: "An Nguyen",
    lastActivityAt: hoursAgo(2),
  },
  {
    id: "cust-002",
    name: "Northwind Vietnam",
    segment: "Mid-market",
    status: "pending",
    email: "ops@northwind.example",
    owner: "Minh Tran",
    lastActivityAt: hoursAgo(8),
  },
  {
    id: "cust-003",
    name: "Saigon Freight",
    segment: "Enterprise",
    status: "inactive",
    email: "support@saigonfreight.example",
    owner: "Phuong Le",
    lastActivityAt: daysAgo(1),
  },
  {
    id: "cust-004",
    name: "Vertex Commerce",
    segment: "Growth",
    status: "active",
    email: "billing@vertex.example",
    owner: "Hoang Pham",
    lastActivityAt: daysAgo(3),
  },
  {
    id: "cust-005",
    name: "Riverside Manufacturing",
    segment: "Enterprise",
    status: "draft",
    email: "controller@riverside.example",
    owner: "Linh Dao",
    lastActivityAt: daysAgo(5),
  },
];

export const activityRows: readonly DashboardTableRow[] = [
  {
    id: "act-001",
    timestamp: hoursAgo(1.5),
    module: "Accounting",
    action: "Journal posted",
    entity: "GL-2041",
    user: "An Nguyen",
    status: "active",
  },
  {
    id: "act-002",
    timestamp: hoursAgo(4),
    module: "Procurement",
    action: "Purchase order approved",
    entity: "PO-1824",
    user: "Minh Tran",
    status: "pending",
  },
  {
    id: "act-003",
    timestamp: hoursAgo(9),
    module: "CRM",
    action: "Customer archived",
    entity: "cust-003",
    user: "Phuong Le",
    status: "inactive",
  },
  {
    id: "act-004",
    timestamp: daysAgo(1.2),
    module: "Inventory",
    action: "Stock adjustment created",
    entity: "INV-9912",
    user: "Hoang Pham",
    status: "active",
  },
];

export const moduleHealth: readonly DashboardModuleHealth[] = [
  {
    moduleName: "Accounting",
    status: "online",
    uptime: 99.98,
    responseTime: 124,
  },
  {
    moduleName: "CRM",
    status: "degraded",
    uptime: 97.6,
    responseTime: 328,
    lastError: "Webhook retries exceeded the soft limit for 12 minutes.",
    lastErrorTime: hoursAgo(3.4),
  },
  {
    moduleName: "Inventory",
    status: "offline",
    uptime: 92.4,
    responseTime: 0,
    lastError: "Warehouse sync endpoint timed out after three attempts.",
    lastErrorTime: hoursAgo(6.8),
  },
];

export const enterpriseKpis: readonly DashboardKpiDefinition[] = [
  {
    change: 8.4,
    description: "Recognized revenue in the current operating month.",
    module: "Commercial",
    title: "Monthly Revenue",
    tone: "success",
    trend: "up",
    value: "$12.4M",
  },
  {
    change: -1.2,
    description: "Open exceptions requiring finance review.",
    module: "Accounting",
    title: "Outstanding Exceptions",
    tone: "warning",
    trend: "down",
    value: 18,
  },
  {
    change: 0.0,
    description: "Approved changes waiting for downstream sync.",
    module: "Operations",
    title: "Pending Integrations",
    tone: "info",
    trend: "flat",
    value: 6,
  },
  {
    change: 99.9,
    description: "Validated records available for the control plane.",
    module: "Platform",
    title: "System Uptime",
    tone: "primary",
    trend: "up",
    value: "99.9%",
  },
];
