import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_INFRASTRUCTURE_INTEGRATION_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function IntegrationPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Integration endpoints, connectors, and sync health (scaffold)."
      featureId={WORKSPACE_INFRASTRUCTURE_INTEGRATION_FEATURE_ID}
      title="Integration"
    >
      <p className="text-muted-foreground text-sm">
        Connector catalog and integration runbooks will be added here.
      </p>
    </FeatureScaffold>
  );
}
