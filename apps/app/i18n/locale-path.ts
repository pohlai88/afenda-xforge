import type { XforgeLocale } from "@repo/internationalization/locales";

import { routing } from "./routing";

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (maybeLocale && routing.locales.includes(maybeLocale as XforgeLocale)) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname;
}

export function localePrefixFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (maybeLocale && routing.locales.includes(maybeLocale as XforgeLocale)) {
    return `/${maybeLocale}`;
  }

  return "";
}

export function withLocalePrefix(
  pathname: string,
  localePrefix: string
): string {
  if (!localePrefix) {
    return pathname;
  }

  if (pathname.startsWith("/")) {
    return `${localePrefix}${pathname}`;
  }

  return `${localePrefix}/${pathname}`;
}
