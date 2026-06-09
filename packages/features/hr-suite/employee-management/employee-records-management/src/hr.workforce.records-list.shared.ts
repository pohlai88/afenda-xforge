import { hrRecordsReadPermission } from "./hr.workforce.records.contract.ts";

export type HrRecordsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrRecordsListColumn = {
  id: string;
  header: string;
};

export type HrRecordsListRow = {
  id: string;
  [key: string]: unknown;
};

type HrRecordsListSearchToolbar = {
  readonly search: {
    readonly param: string;
    readonly label: string;
    readonly placeholder: string;
    readonly value: string;
  };
};

type HrRecordsOperationalListSurface = {
  readonly permissions: typeof hrRecordsReadPermission;
  readonly primaryColumnId: string;
  readonly searchToolbar: HrRecordsListSearchToolbar;
  readonly window: HrRecordsListWindow;
  readonly surface: {
    readonly headerTitle: string;
    readonly columnsId: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
  };
  readonly columns: readonly HrRecordsListColumn[];
  readonly rows: readonly HrRecordsListRow[];
};

export function buildHrRecordsListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}): HrRecordsListSearchToolbar {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value ?? "",
    },
  } as const;
}

export function buildHrRecordsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: HrRecordsListSearchToolbar;
  window: HrRecordsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: HrRecordsListColumn[];
  rows: HrRecordsListRow[];
}): HrRecordsOperationalListSurface {
  return {
    permissions: hrRecordsReadPermission,
    primaryColumnId: input.primaryColumnId,
    searchToolbar: input.searchToolbar,
    window: input.window,
    surface: input.surface,
    columns: input.columns,
    rows: input.rows,
  } as const;
}

export function formatRecordsEmploymentStatusLabel(status: string): string {
  return status
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function formatRecordsMissingFieldsLabel(
  fields: readonly string[]
): string {
  return fields
    .map((field) =>
      field
        .split("_")
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" ")
    )
    .join(", ");
}

export function formatRecordsAssignmentStatusLabel(status: string): string {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

export function formatRecordsEventKindLabel(kind: string): string {
  return kind
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function resolveHrRecordsListTrailingAction(canWrite: boolean):
  | {
      allowed: true;
      visible: true;
      kind: "trailing-action";
    }
  | undefined {
  return canWrite
    ? { allowed: true, visible: true, kind: "trailing-action" as const }
    : undefined;
}
