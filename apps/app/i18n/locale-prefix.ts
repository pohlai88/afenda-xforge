import { routing } from "./routing";
import { withLocalePrefix } from "./locale-path";

export function localePrefixFor(locale: string): string {
  if (
    routing.localePrefix === "as-needed" &&
    locale === routing.defaultLocale
  ) {
    return "";
  }

  return `/${locale}`;
}

export function localizedPath(pathname: string, locale: string): string {
  return withLocalePrefix(pathname, localePrefixFor(locale));
}
