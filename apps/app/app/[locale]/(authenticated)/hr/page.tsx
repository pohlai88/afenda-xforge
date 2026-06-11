import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import type { ReactElement } from "react";
import { createAppMetadataContext } from "../../../_lib/metadata-context.ts";
import { loadHrHubPageData } from "./_data.ts";
import { HrHubView } from "./hr-hub-view.tsx";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

export default async function HrHubPage(): Promise<ReactElement> {
  const data = await loadHrHubPageData();
  const context = createAppMetadataContext({
    featureId: HR_DOCUMENTS_FEATURE_ID,
    permissions: data.grantedPermissions,
    tenantId: data.tenantId,
    userId: data.actorId,
  });

  return (
    <HrHubView
      context={context}
      data={data}
      metadata={hrDocumentEntityMetadata}
    />
  );
}
