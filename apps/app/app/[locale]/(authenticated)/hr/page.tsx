import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { MetadataFeatureShell } from "../../../_components/metadata-feature-shell.tsx";
import { createAppMetadataContext } from "../../../_lib/metadata-context.ts";
import { loadDocumentsManagementOverviewPageData } from "./documents/documents-management-overview-data.ts";
import { DocumentsManagementOverviewView } from "./documents/documents-management-overview-view.tsx";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

const renderNavigationActions = (): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Button asChild variant="outline">
      <Link href="/dashboard">Back to dashboard</Link>
    </Button>
  </div>
);

export default async function DocumentsManagementOverviewPage(): Promise<ReactElement> {
  const overview = await loadDocumentsManagementOverviewPageData();

  if (overview.status === "forbidden") {
    return (
      <>
        <MetadataFeatureShell
          featureId={HR_DOCUMENTS_FEATURE_ID}
          forbiddenDescription="Documents Management requires tenant-scoped document read access. Contact your administrator if you need HR operator permissions."
          forbiddenTitle="Documents Management unavailable"
          state="forbidden"
        />
        {renderNavigationActions()}
      </>
    );
  }

  if (overview.status === "error") {
    return (
      <>
        <MetadataFeatureShell
          error={overview.message}
          featureId={HR_DOCUMENTS_FEATURE_ID}
          state="error"
        />
        {renderNavigationActions()}
      </>
    );
  }

  const context = createAppMetadataContext({
    featureId: HR_DOCUMENTS_FEATURE_ID,
    permissions: overview.data.grantedPermissions,
    tenantId: overview.data.tenantId,
    userId: overview.data.actorId,
  });

  return (
    <DocumentsManagementOverviewView
      context={context}
      data={overview.data}
      metadata={hrDocumentEntityMetadata}
    />
  );
}
