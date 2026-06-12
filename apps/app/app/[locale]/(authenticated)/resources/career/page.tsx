import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_RESOURCES_CAREER_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function ResourcesCareerPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Career — growth paths, learning, and internal mobility (scaffold)."
      featureId={WORKSPACE_RESOURCES_CAREER_FEATURE_ID}
      title="Career"
    >
      <p className="text-muted-foreground text-sm">
        Career journeys and learning catalog hooks will connect here.
      </p>
    </FeatureScaffold>
  );
}
