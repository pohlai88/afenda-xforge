import { withToolbar } from "@repo/feature-flags/lib/toolbar";
import { createNextConfig, withAnalyzer } from "@repo/next-config";
import { withSentry } from "@repo/observability/next-config";

export default withSentry(withAnalyzer(withToolbar(createNextConfig())));
