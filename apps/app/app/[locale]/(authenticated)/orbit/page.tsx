import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_ORBIT_FEATURE_ID } from "../../../_components/workspace-scaffold/workspace-feature-ids.ts";
import { OrbitView } from "./orbit-view.tsx";

export default function OrbitPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Critical workload signal for today — status, capacity, and focus in one orbit."
      featureId={WORKSPACE_ORBIT_FEATURE_ID}
      title="The Orbit"
    >
      <OrbitView />
    </FeatureScaffold>
  );
}
