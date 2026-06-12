import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_RESOURCES_DEPARTMENT_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";

export default function ResourcesDepartmentPage(): ReactElement {
  return (
    <FeatureScaffold
      description="My department — teams, goals, and local operating rhythm (scaffold)."
      featureId={WORKSPACE_RESOURCES_DEPARTMENT_FEATURE_ID}
      title="My department"
    >
      <p className="text-muted-foreground text-sm">
        Department charter and shared resources will be listed here.
      </p>
    </FeatureScaffold>
  );
}
