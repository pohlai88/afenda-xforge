import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { FieldVisualState } from "../renderers/fields/field-visual-state";

export type MetadataFormattingContext = Pick<
  MetadataRenderContext,
  "locale" | "timezone"
>;

const localeByLanguage: Record<string, string> = {
  en: "en-US",
  vi: "vi-VN",
};

export function resolveIntlLocale(locale: string): string {
  const normalized = locale.trim();

  if (localeByLanguage[normalized]) {
    return localeByLanguage[normalized];
  }

  if (normalized.includes("-")) {
    return normalized;
  }

  return normalized;
}

export function coerceNumericValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return;
}

export function coerceDateValue(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return;
}

export function resolveCurrencyCode(
  formatting: MetadataFormattingContext,
  field?: MetadataFieldContract
): string {
  const metadataCurrency = field?.metadata?.currency;

  if (typeof metadataCurrency === "string" && metadataCurrency.trim()) {
    return metadataCurrency.trim();
  }

  return formatting.locale.startsWith("vi") ? "VND" : "USD";
}

export function formatMetadataNumber(
  value: unknown,
  formatting: MetadataFormattingContext,
  options: Intl.NumberFormatOptions = {}
): string {
  const numericValue = coerceNumericValue(value);

  if (numericValue === undefined) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.NumberFormat(resolveIntlLocale(formatting.locale), {
    maximumFractionDigits: 6,
    ...options,
  }).format(numericValue);
}

export function formatMetadataMoney(
  value: unknown,
  formatting: MetadataFormattingContext,
  field?: MetadataFieldContract
): string {
  const numericValue = coerceNumericValue(value);

  if (numericValue === undefined) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.NumberFormat(resolveIntlLocale(formatting.locale), {
    currency: resolveCurrencyCode(formatting, field),
    style: "currency",
  }).format(numericValue);
}

export function formatMetadataDate(
  value: unknown,
  formatting: MetadataFormattingContext
): string {
  const dateValue = coerceDateValue(value);

  if (!dateValue) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.DateTimeFormat(resolveIntlLocale(formatting.locale), {
    day: "numeric",
    month: "short",
    timeZone: formatting.timezone,
    year: "numeric",
  }).format(dateValue);
}

export function resolveMetadataDateInputValue(value: unknown): string {
  const dateValue = coerceDateValue(value);

  if (!dateValue) {
    return typeof value === "string" ? value : "";
  }

  return dateValue.toISOString().slice(0, 10);
}

export function resolveMetadataNumberInputValue(value: unknown): string {
  const numericValue = coerceNumericValue(value);

  if (numericValue === undefined) {
    return "";
  }

  return String(numericValue);
}

export function shouldFormatFieldForDisplay(
  context: MetadataRenderContext,
  visualState: FieldVisualState
): boolean {
  return (
    context.mode === "read" ||
    context.readonly === true ||
    visualState.isReadOnly ||
    visualState.isDisabled
  );
}

export function formatMetadataTableCellValue(
  value: unknown,
  kind: MetadataFieldContract["kind"] | undefined,
  formatting: MetadataFormattingContext,
  fieldMetadata?: Record<string, unknown>
): string | null {
  const field =
    fieldMetadata === undefined
      ? undefined
      : ({ metadata: fieldMetadata } as MetadataFieldContract);

  switch (kind) {
    case "money":
      return formatMetadataMoney(value, formatting, field);
    case "number":
      return formatMetadataNumber(value, formatting);
    case "date":
      return formatMetadataDate(value, formatting);
    default:
      return null;
  }
}
