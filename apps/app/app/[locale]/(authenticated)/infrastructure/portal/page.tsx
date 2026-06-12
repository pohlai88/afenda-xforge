import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_INFRASTRUCTURE_PORTAL_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function PortalPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Operator and stakeholder portal entry (scaffold)."
      featureId={WORKSPACE_INFRASTRUCTURE_PORTAL_FEATURE_ID}
      title="Portal"
    >
      <p className="text-muted-foreground text-sm">
        Portal tiles and deep links into governed surfaces will be grouped
        here.
      </p>
    </FeatureScaffold>
  );
}
