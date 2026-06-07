import type { LocaleResolutionOptions, XforgeLocale } from "./locales.js";
import {
  acceptLanguageHeaderName,
  defaultLocale,
  localeCookieName,
  localeHeaderName,
  resolveLocale,
  supportedLocales,
} from "./locales.js";

export type HeaderReader = {
  get(name: string): string | null | undefined;
};

type ParsedLanguagePreference = {
  quality: number;
  value: string;
};

const parseLanguageQuality = (value: string): number => {
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.min(1, Math.max(0, parsed));
};

export const parseAcceptLanguage = (header: string): string[] =>
  header
    .split(",")
    .map((part): ParsedLanguagePreference | null => {
      const [rawValue, ...parameters] = part.trim().split(";");

      if (!rawValue || rawValue === "*") {
        return null;
      }

      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q=")
      );
      const quality = qualityParameter
        ? parseLanguageQuality(qualityParameter.trim().slice(2))
        : 1;

      return {
        quality,
        value: rawValue,
      };
    })
    .filter(
      (preference): preference is ParsedLanguagePreference =>
        preference !== null
    )
    .sort((left, right) => right.quality - left.quality)
    .map((preference) => preference.value);

export const resolveLocaleFromHeader = <TLocale extends string>(
  headerValue: string | null | undefined,
  options: LocaleResolutionOptions<TLocale>
): TLocale => {
  if (!headerValue) {
    return options.fallbackLocale;
  }

  const candidates =
    headerValue.includes(",") || headerValue.includes(";q=")
      ? parseAcceptLanguage(headerValue)
      : [headerValue];

  for (const candidate of candidates) {
    const locale = resolveLocale(candidate, options);

    if (
      locale !== options.fallbackLocale ||
      candidate === options.fallbackLocale
    ) {
      return locale;
    }
  }

  return options.fallbackLocale;
};

const readLocaleFromCookieHeader = (
  cookieHeader: string | null | undefined,
  cookieName: string
): string | undefined => {
  if (!cookieHeader) {
    return;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  return cookie
    ? decodeURIComponent(cookie.slice(cookieName.length + 1))
    : undefined;
};

export type RequestLocaleOptions<TLocale extends string> = {
  acceptLanguageHeader?: string;
  cookieHeader?: string;
  cookieName?: string;
  fallbackLocale?: TLocale;
  localeHeader?: string;
  supportedLocales?: readonly TLocale[];
};

export const resolveLocaleFromHeaders = <TLocale extends string>(
  headers: HeaderReader,
  options: RequestLocaleOptions<TLocale> = {}
): TLocale => {
  const fallbackLocale = options.fallbackLocale ?? (defaultLocale as TLocale);
  const availableLocales =
    options.supportedLocales ??
    (supportedLocales as unknown as readonly TLocale[]);
  const explicitLocale = headers.get(options.localeHeader ?? localeHeaderName);
  const cookieLocale = readLocaleFromCookieHeader(
    headers.get(options.cookieHeader ?? "cookie"),
    options.cookieName ?? localeCookieName
  );

  if (explicitLocale) {
    return resolveLocale(explicitLocale, {
      fallbackLocale,
      supportedLocales: availableLocales,
    });
  }

  if (cookieLocale) {
    return resolveLocale(cookieLocale, {
      fallbackLocale,
      supportedLocales: availableLocales,
    });
  }

  return resolveLocaleFromHeader(
    headers.get(options.acceptLanguageHeader ?? acceptLanguageHeaderName),
    {
      fallbackLocale,
      supportedLocales: availableLocales,
    }
  );
};

export const resolveXforgeLocaleFromHeaders = (
  headers: HeaderReader
): XforgeLocale =>
  resolveLocaleFromHeaders(headers, {
    fallbackLocale: defaultLocale,
    supportedLocales,
  });
