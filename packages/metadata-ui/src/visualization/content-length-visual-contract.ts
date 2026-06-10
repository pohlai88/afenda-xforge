export const METADATA_EMPTY_DISPLAY_VALUE = "—";

export const METADATA_LONG_CONTENT_FIXTURES = {
  description:
    "This is an intentionally long description used to verify that metadata-ui surfaces truncate or wrap long copy without breaking layout hierarchy or pushing actions off-screen.",
  email: "very.long.customer.account.identifier@enterprise.example.com",
  label:
    "Extended metadata field label that exceeds typical form column width and must remain accessible without breaking grid alignment",
  status: "awaiting-internal-compliance-review-before-publication-and-release",
  title:
    "Quarterly consolidated revenue recognition audit workbook export summary",
  value:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
} as const;

export const METADATA_TABLE_CELL_CONTENT_CLASS =
  "block min-w-0 max-w-[16rem] truncate";

export const METADATA_TABLE_HEADER_LABEL_CLASS =
  "inline-block min-w-0 max-w-[12rem] truncate";

export const METADATA_TABLE_LINK_CLASS = "block min-w-0 max-w-[16rem] truncate";

export const METADATA_FIELD_LABEL_CLASS = "min-w-0 break-words line-clamp-2";

export const METADATA_FIELD_HELP_CLASS = "min-w-0 break-words line-clamp-3";

export const METADATA_TOOLBAR_TITLE_CLASS = "min-w-0 truncate";

export const METADATA_TOOLBAR_EYEBROW_CLASS =
  "min-w-0 truncate tracking-[0.3em]";

export const METADATA_TOOLBAR_DESCRIPTION_CLASS =
  "min-w-0 break-words line-clamp-3";

export const METADATA_TOOLBAR_BADGE_CLASS =
  "inline-block min-w-0 max-w-[12rem] truncate";

export const METADATA_FORM_TITLE_CLASS = "min-w-0 truncate";

export const METADATA_FORM_DESCRIPTION_CLASS =
  "min-w-0 break-words line-clamp-3";

export const METADATA_STATUS_BADGE_CLASS =
  "inline-block min-w-0 max-w-full truncate";

export function resolveMetadataDisplayValue(
  value: unknown,
  fallback: string = METADATA_EMPTY_DISPLAY_VALUE
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string" && value.trim() === "") {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}

export function resolveMetadataFormattedDisplayValue(
  formatted: string | null | undefined,
  fallback: string = METADATA_EMPTY_DISPLAY_VALUE
): string {
  if (formatted === null || formatted === undefined) {
    return fallback;
  }

  return formatted.trim() === "" ? fallback : formatted;
}

export function resolveMetadataTableCellClassName(className?: string): string {
  return [METADATA_TABLE_CELL_CONTENT_CLASS, className]
    .filter(Boolean)
    .join(" ");
}
