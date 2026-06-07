export type MetadataColumnKind = "email" | "status" | "text";

export type EntityLabels = {
  plural: string;
  singular: string;
};

export type TableColumnMetadata = {
  key: string;
  label: string;
  kind?: MetadataColumnKind;
};

export type EntityTableMetadata = {
  columns: readonly TableColumnMetadata[];
  defaultSort: string;
};

export type EntityMetadata = {
  entity: string;
  labels: EntityLabels;
  table?: EntityTableMetadata;
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
  link?: string;
  module?: string;
  title: string;
  tone?: DashboardKpiTone;
  trend?: DashboardKpiTrend;
  value: number | string;
};

export type DashboardChartType = "bar" | "doughnut" | "line" | "pie";

export type DashboardChartDataset = {
  backgroundColor?: string;
  borderColor?: string;
  data: readonly (number | null)[];
  fill?: boolean;
  label: string;
};

export type DashboardChartDefinition = {
  datasets: readonly DashboardChartDataset[];
  labels: readonly string[];
  type: DashboardChartType;
};

export type DashboardWidgetSize = "lg" | "md" | "sm" | "xl";

export type DashboardWidgetType =
  | "chart"
  | "custom"
  | "kpi"
  | "moduleStatus"
  | "table";

export type DashboardWidgetDefinition = {
  data?: Record<string, unknown>;
  error?: string | null;
  id: string;
  loading?: boolean;
  module?: string;
  refreshInterval?: number;
  size: DashboardWidgetSize;
  title: string;
  type: DashboardWidgetType;
};

export type DashboardLayoutDefinition = {
  columns: 1 | 2 | 3 | 4;
  gap: "lg" | "md" | "sm";
  widgets: readonly DashboardWidgetDefinition[];
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

export type DashboardTableColumn = {
  key: string;
  label: string;
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
