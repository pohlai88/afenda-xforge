export const supportedLocales = ["en", "vi"] as const;

export type XforgeLocale = (typeof supportedLocales)[number];

export const defaultLocale: XforgeLocale = "en";

export const localeCookieName = "xforge_locale";
export const localeHeaderName = "x-locale";
export const acceptLanguageHeaderName = "accept-language";

const normalizeLocaleToken = (value: string): string =>
  value.trim().toLowerCase().replaceAll("_", "-");

const buildLocaleCandidates = (value: string): string[] => {
  const normalized = normalizeLocaleToken(value);

  if (!normalized) {
    return [];
  }

  const [language] = normalized.split("-");

  if (!language) {
    return [];
  }

  return normalized === language ? [language] : [normalized, language];
};

const buildSupportedLocaleMap = <TLocale extends string>(
  locales: readonly TLocale[]
): Map<string, TLocale> =>
  new Map(
    locales.flatMap((locale) =>
      buildLocaleCandidates(locale).map(
        (candidate) => [candidate, locale] as const
      )
    )
  );

export const isSupportedLocale = (
  value: string | null | undefined
): value is XforgeLocale =>
  Boolean(
    value &&
      buildSupportedLocaleMap(supportedLocales).has(normalizeLocaleToken(value))
  );

export type LocaleResolutionOptions<TLocale extends string> = {
  fallbackLocale: TLocale;
  supportedLocales: readonly TLocale[];
};

export const resolveLocale = <TLocale extends string>(
  value: string | null | undefined,
  options: LocaleResolutionOptions<TLocale>
): TLocale => {
  if (!value) {
    return options.fallbackLocale;
  }

  const localeMap = buildSupportedLocaleMap(options.supportedLocales);

  for (const candidate of buildLocaleCandidates(value)) {
    const match = localeMap.get(candidate);

    if (match) {
      return match;
    }
  }

  return options.fallbackLocale;
};

export const getTextDirection = (locale: string): "ltr" | "rtl" => {
  const normalized = normalizeLocaleToken(locale);

  return normalized.startsWith("ar") ||
    normalized.startsWith("fa") ||
    normalized.startsWith("he") ||
    normalized.startsWith("ur")
    ? "rtl"
    : "ltr";
};
