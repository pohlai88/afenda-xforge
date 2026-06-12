import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_RESOURCES_ORGANIZATION_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function ResourcesOrganizationPage(): ReactElement {
  return (
    <FeatureScaffold
      description="My organization — structure, policies, and tenant context (scaffold)."
      featureId={WORKSPACE_RESOURCES_ORGANIZATION_FEATURE_ID}
      title="My organization"
    >
      <p className="text-muted-foreground text-sm">
        Organization profile and hierarchy preview will appear here.
      </p>
    </FeatureScaffold>
  );
}
