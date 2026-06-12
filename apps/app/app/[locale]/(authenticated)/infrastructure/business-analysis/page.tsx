import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_INFRASTRUCTURE_BUSINESS_ANALYSIS_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function BusinessAnalysisPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Business analysis lenses, KPI drill-downs, and narrative reports (scaffold)."
      featureId={WORKSPACE_INFRASTRUCTURE_BUSINESS_ANALYSIS_FEATURE_ID}
      title="Business analysis"
    >
      <p className="text-muted-foreground text-sm">
        Analysis workspaces and export flows will connect to Orbit signals
        later.
      </p>
    </FeatureScaffold>
  );
}
