import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_RESOURCES_TEAM_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function ResourcesTeamPage(): ReactElement {
  return (
    <FeatureScaffold
      description="My team — roster, rituals, and collaboration (scaffold)."
      featureId={WORKSPACE_RESOURCES_TEAM_FEATURE_ID}
      title="My team"
    >
      <p className="text-muted-foreground text-sm">
        Team roster and working agreements will be surfaced here.
      </p>
    </FeatureScaffold>
  );
}
