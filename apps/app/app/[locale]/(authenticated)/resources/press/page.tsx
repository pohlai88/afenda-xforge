import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_RESOURCES_PRESS_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function ResourcesPressPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Press — news, announcements, and external comms (scaffold)."
      featureId={WORKSPACE_RESOURCES_PRESS_FEATURE_ID}
      title="Press"
    >
      <p className="text-muted-foreground text-sm">
        Press releases and media kits will be published from this lane.
      </p>
    </FeatureScaffold>
  );
}
