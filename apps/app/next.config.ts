import { withToolbar } from "@repo/feature-flags/lib/toolbar";
import { createNextConfig, withAnalyzer } from "@repo/next-config";

export default withAnalyzer(withToolbar(createNextConfig()));
