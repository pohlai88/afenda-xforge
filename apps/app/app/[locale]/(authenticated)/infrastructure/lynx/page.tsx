import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_INFRASTRUCTURE_LYNX_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function LynxPage(): ReactElement {
  return (
    <FeatureScaffold
      description="The machine — Lynx orchestration surface (scaffold)."
      featureId={WORKSPACE_INFRASTRUCTURE_LYNX_FEATURE_ID}
      title="Lynx"
    >
      <p className="text-muted-foreground text-sm">
        Lynx runtime and agent flows will land here before Orbit and matrix
        integration.
      </p>
    </FeatureScaffold>
  );
}
