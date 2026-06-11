import { withToolbar } from "@repo/feature-flags/lib/toolbar";
import { createNextConfig, withAnalyzer } from "@repo/next-config";
import { withSentry } from "@repo/observability/next-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(
  withSentry(withAnalyzer(withToolbar(createNextConfig())))
);
