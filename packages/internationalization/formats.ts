import type { XforgeLocale } from "./locales.ts";
import { defaultLocale, resolveLocale, supportedLocales } from "./locales.ts";

const localeByLanguage: Record<XforgeLocale, string> = {
  en: "en-US",
  vi: "vi-VN",
};

const toIntlLocale = (locale: string): string =>
  localeByLanguage[
    resolveLocale(locale, {
      fallbackLocale: defaultLocale,
      supportedLocales,
    })
  ];

export const formatNumber = (
  value: number,
  locale: string = defaultLocale,
  options: Intl.NumberFormatOptions = {}
): string => new Intl.NumberFormat(toIntlLocale(locale), options).format(value);

export const formatCurrency = (
  value: number,
  locale: string = defaultLocale,
  currency?: string
): string => {
  const resolvedLocale = resolveLocale(locale, {
    fallbackLocale: defaultLocale,
    supportedLocales,
  });

  return formatNumber(value, resolvedLocale, {
    currency: currency ?? (resolvedLocale === "vi" ? "VND" : "USD"),
    style: "currency",
  });
};

export const formatVnd = (value: number): string =>
  formatCurrency(value, "vi", "VND");

export const parseVnd = (value: string): number => {
  const normalized = value
    .replace(/[^\d,-.]/g, "")
    .replaceAll(".", "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);

  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatDate = (
  value: Date | number | string,
  locale: string = defaultLocale,
  options: Intl.DateTimeFormatOptions = {}
): string =>
  new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(value instanceof Date ? value : new Date(value));

export const formatDateTime = (
  value: Date | number | string,
  locale: string = defaultLocale,
  options: Intl.DateTimeFormatOptions = {}
): string =>
  new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(value instanceof Date ? value : new Date(value));

export const formatVietnamesePhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  let normalized = digits;

  if (digits.startsWith("84")) {
    normalized = `0${digits.slice(2)}`;
  } else if (digits.length === 9) {
    normalized = `0${digits}`;
  }

  if (normalized.length !== 10) {
    return normalized;
  }

  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
};
