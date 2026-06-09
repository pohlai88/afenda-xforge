import type { HrRecordsListWindow } from "./list.shared.ts";
import {
  buildHrRecordsListSearchToolbar,
  buildHrRecordsOperationalListSurface,
} from "./list.shared.ts";

export type EmptyState = {
  description: string;
  title: string;
  variant: "error" | "muted";
};

export function buildRecordsEmbeddedListLoadError(
  sectionTitle: string
): EmptyState {
  return {
    variant: "error",
    title: `${sectionTitle} unavailable`,
    description:
      "This register could not be loaded. Refresh the page or try again later.",
  };
}

export async function settleRecordsListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ value?: T; loadError?: EmptyState }> {
  try {
    return { value: await input.load() };
  } catch {
    return { loadError: buildRecordsEmbeddedListLoadError(input.sectionTitle) };
  }
}

export function buildRecordsListLoadErrorPlaceholder(input: {
  columnsId: string;
  searchParam: string;
  searchLabel: string;
  searchPlaceholder: string;
  surfaceHeaderTitle: string;
  emptyTitle?: string;
  emptyDescription?: string;
}): ReturnType<typeof buildHrRecordsOperationalListSurface> {
  return buildHrRecordsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildHrRecordsListSearchToolbar({
      param: input.searchParam,
      label: input.searchLabel,
      placeholder: input.searchPlaceholder,
    }),
    window: {
      pageSize: 25,
      totalCount: 0,
      hasNextPage: false,
    } satisfies HrRecordsListWindow,
    surface: {
      headerTitle: input.surfaceHeaderTitle,
      columnsId: input.columnsId,
      emptyTitle: input.emptyTitle ?? "Register unavailable",
      emptyDescription:
        input.emptyDescription ??
        "This register could not be loaded. Refresh the page and try again.",
    },
    columns: [{ id: "employee", header: "—" }],
    rows: [],
  });
}
