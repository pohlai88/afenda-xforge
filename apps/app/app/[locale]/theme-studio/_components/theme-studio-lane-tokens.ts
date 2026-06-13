import type { AfendaErpVisualLaneId as ErpVisualLaneId } from "@repo/design-system/contracts/afenda/registries";

export const LANE_PREVIEW_LABELS: Record<ErpVisualLaneId, string> = {
  money: "Finance",
  people: "HR",
  goods: "Inventory",
  operations: "Production",
  customer: "CRM",
  governance: "Governance",
  intelligence: "Lynx",
};

export const LANE_DOT_CLASS: Record<ErpVisualLaneId, string> = {
  money: "bg-lane-money",
  people: "bg-lane-people",
  goods: "bg-lane-goods",
  operations: "bg-lane-operations",
  customer: "bg-lane-customer",
  governance: "bg-lane-governance",
  intelligence: "bg-lane-intelligence",
};

export const LANE_ROW_CLASS: Record<ErpVisualLaneId, string> = {
  money: "border-lane-money-border bg-lane-money-muted",
  people: "border-lane-people-border bg-lane-people-muted",
  goods: "border-lane-goods-border bg-lane-goods-muted",
  operations: "border-lane-operations-border bg-lane-operations-muted",
  customer: "border-lane-customer-border bg-lane-customer-muted",
  governance: "border-lane-governance-border bg-lane-governance-muted",
  intelligence: "border-lane-intelligence-border bg-lane-intelligence-muted",
};

export const LANE_PILL_CLASS: Record<ErpVisualLaneId, string> = {
  money:
    "border-lane-money-border bg-lane-money-muted text-lane-money-muted-foreground",
  people:
    "border-lane-people-border bg-lane-people-muted text-lane-people-muted-foreground",
  goods:
    "border-lane-goods-border bg-lane-goods-muted text-lane-goods-muted-foreground",
  operations:
    "border-lane-operations-border bg-lane-operations-muted text-lane-operations-muted-foreground",
  customer:
    "border-lane-customer-border bg-lane-customer-muted text-lane-customer-muted-foreground",
  governance:
    "border-lane-governance-border bg-lane-governance-muted text-lane-governance-muted-foreground",
  intelligence:
    "border-lane-intelligence-border bg-lane-intelligence-muted text-lane-intelligence-muted-foreground",
};

export const LANE_SOLID_CLASS: Record<ErpVisualLaneId, string> = {
  money: "bg-lane-money text-lane-money-foreground",
  people: "bg-lane-people text-lane-people-foreground",
  goods: "bg-lane-goods text-lane-goods-foreground",
  operations: "bg-lane-operations text-lane-operations-foreground",
  customer: "bg-lane-customer text-lane-customer-foreground",
  governance: "bg-lane-governance text-lane-governance-foreground",
  intelligence: "bg-lane-intelligence text-lane-intelligence-foreground",
};

export const LANE_SYSTEM_TITLE: Record<ErpVisualLaneId, string> = {
  money: "Money",
  people: "People",
  goods: "Goods",
  operations: "Operations",
  customer: "Customer",
  governance: "Governance",
  intelligence: "Intelligence",
};

export const LANE_SYSTEM_MODULES: Record<ErpVisualLaneId, string> = {
  money: "Finance, AP, AR, Treasury",
  people: "HR, Payroll, Recruitment",
  goods: "Inventory, Warehouse, Procurement",
  operations: "Production, Maintenance, Scheduling",
  customer: "CRM, Sales, Service",
  governance: "Admin, Policies, Audit",
  intelligence: "Lynx, Nexus, Evidence",
};

export const LANE_SYSTEM_DESCRIPTION: Record<ErpVisualLaneId, string> = {
  money: "Commercial and financial control surfaces.",
  people: "Employee and workforce management surfaces.",
  goods: "Material, stock, and supply chain surfaces.",
  operations: "Execution-heavy operational surfaces.",
  customer: "Customer-facing commercial workflows.",
  governance: "Control, permission, and compliance surfaces.",
  intelligence: "Search, reasoning, and decision surfaces.",
};

export const ERP_VISUAL_LANE_ORDER: readonly ErpVisualLaneId[] = [
  "money",
  "people",
  "goods",
  "operations",
  "customer",
  "governance",
  "intelligence",
] as const;
