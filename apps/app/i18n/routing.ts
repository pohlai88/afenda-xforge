import {
  defaultLocale,
  supportedLocales,
} from "@repo/internationalization/locales";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [...supportedLocales],
  defaultLocale,
  localePrefix: "as-needed",
});
