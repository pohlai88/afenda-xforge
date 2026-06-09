import { hrWorkforceRecordsReadPermission } from "./hr.workforce.records.contract.ts";

export type RecordsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type RecordsListColumn = {
  id: string;
  header: string;
};

export type RecordsListRow = {
  id: string;
  [key: string]: unknown;
};

type RecordsListSearchToolbar = {
  readonly search: {
    readonly param: string;
    readonly label: string;
    readonly placeholder: string;
    readonly value: string;
  };
};

type RecordsOperationalListSurface = {
  readonly permissions: typeof hrWorkforceRecordsReadPermission;
  readonly primaryColumnId: string;
  readonly searchToolbar: RecordsListSearchToolbar;
  readonly window: RecordsListWindow;
  readonly surface: {
    readonly headerTitle: string;
    readonly columnsId: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
  };
  readonly columns: readonly RecordsListColumn[];
  readonly rows: readonly RecordsListRow[];
};

export function buildRecordsListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}): RecordsListSearchToolbar {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value ?? "",
    },
  } as const;
}

export function buildRecordsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: RecordsListSearchToolbar;
  window: RecordsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: RecordsListColumn[];
  rows: RecordsListRow[];
}): RecordsOperationalListSurface {
  return {
    permissions: hrWorkforceRecordsReadPermission,
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

export function resolveRecordsListTrailingAction(canWrite: boolean):
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
