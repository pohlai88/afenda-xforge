import type { ReactElement } from "react";
import { FeatureScaffold } from "../../../../_components/workspace-scaffold/feature-scaffold.tsx";
import { WORKSPACE_INFRASTRUCTURE_MATRIX_FEATURE_ID } from "../../../../_components/workspace-scaffold/workspace-feature-ids.ts";
import { MatrixView } from "./matrix-view.tsx";

export default function InfrastructureMatrixPage(): ReactElement {
  return (
    <FeatureScaffold
      description="Eisenhower matrix in three tabs — urgent, important, and urgent + important. Capture notes, links, and files before Orbit integration."
      featureId={WORKSPACE_INFRASTRUCTURE_MATRIX_FEATURE_ID}
      title="Eisenhower matrix"
    >
      <MatrixView />
    </FeatureScaffold>
  );
}
