import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { resolveObjectStorageProviderKind } from "@repo/storage/provider";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { MetadataFeatureShell } from "../../../../_components/metadata-feature-shell.tsx";
import { createAppMetadataContext } from "../../../../_lib/metadata-context.ts";
import { loadEntityMetadataCustomizations } from "../../../../_lib/metadata-customizations.ts";
import { loadHrDocumentsPageData } from "./_data.ts";
import { DocumentsView } from "./documents-view.tsx";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

const renderNavigationActions = (): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Button asChild variant="outline">
      <Link href="/hr">Back to HR hub</Link>
    </Button>
    <Button asChild variant="outline">
      <Link href="/dashboard">Back to dashboard</Link>
    </Button>
  </div>
);

export default async function HrDocumentsPage(): Promise<ReactElement> {
  const documents = await loadHrDocumentsPageData();
  const storageProvider = resolveObjectStorageProviderKind() ?? "blob";

  if (documents.status === "forbidden") {
    return (
      <>
        <MetadataFeatureShell
          featureId={HR_DOCUMENTS_FEATURE_ID}
          forbiddenDescription="Document browsing requires an HR role with tenant-scoped document access."
          forbiddenTitle="Document storage unavailable"
          state="forbidden"
        />
        {renderNavigationActions()}
      </>
    );
  }

  if (documents.status === "error") {
    return (
      <>
        <MetadataFeatureShell
          error={documents.message}
          featureId={HR_DOCUMENTS_FEATURE_ID}
          state="error"
        />
        {renderNavigationActions()}
      </>
    );
  }

  const { data } = documents;
  const customizations = await loadEntityMetadataCustomizations({
    tenantId: data.tenantId,
  });
  const context = createAppMetadataContext({
    featureId: HR_DOCUMENTS_FEATURE_ID,
    permissions: data.grantedPermissions,
    tenantId: data.tenantId,
    userId: data.actorId,
  });

  return (
    <DocumentsView
      context={context}
      customizationLayers={customizations}
      data={data}
      metadata={hrDocumentEntityMetadata}
      storageProvider={storageProvider}
    />
  );
}
