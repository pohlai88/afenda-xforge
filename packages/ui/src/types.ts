export type MetadataColumnKind = "email" | "status" | "text";

export type TableColumnMetadata = {
  align?: "center" | "end" | "start";
  description?: string;
  field?: string;
  key: string;
  label: string;
  kind?: MetadataColumnKind | "date" | "money";
  filterable?: boolean;
  sortable?: boolean;
  width?: "auto" | "lg" | "md" | "sm";
};

export type DashboardTableValue =
  | boolean
  | Date
  | null
  | number
  | string
  | undefined;

export type DashboardTableRow = {
  id: string;
  [key: string]: DashboardTableValue;
};

export type DashboardWidgetSize = "lg" | "md" | "sm" | "xl";

export type DashboardWidgetDefinition = {
  id: string;
  size: DashboardWidgetSize;
};

export type DashboardKpiTone =
  | "danger"
  | "info"
  | "primary"
  | "success"
  | "warning";

export type DashboardKpiTrend = "down" | "flat" | "up";

export type DashboardKpiDefinition = {
  change?: number;
  description?: string;
  link?: string;
  module?: string;
  title: string;
  tone?: DashboardKpiTone;
  trend?: DashboardKpiTrend;
  value: number | string;
};

export type DashboardModuleHealthStatus = "degraded" | "offline" | "online";

export type DashboardModuleHealth = {
  lastError?: string;
  lastErrorTime?: Date;
  moduleName: string;
  responseTime?: number;
  status: DashboardModuleHealthStatus;
  uptime: number;
};
