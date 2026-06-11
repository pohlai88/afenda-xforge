import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import Link from "next/link";
import type { ReactElement } from "react";
import { MetadataFeatureShell } from "../../../../../_components/metadata-feature-shell.tsx";
import { createAppMetadataContext } from "../../../../../_lib/metadata-context.ts";
import {
  loadEntityMetadataCustomizations,
} from "../../../../../_lib/metadata-customizations.ts";
import { Button } from "@repo/ui/components/button";
import { DocumentDetailView } from "../document-detail-view.tsx";
import { loadHrDocumentDetailPageData } from "../_data.ts";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

type DocumentDetailPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

const renderNavigationActions = (): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Button asChild variant="outline">
      <Link href="/hr/documents">Back to documents</Link>
    </Button>
    <Button asChild variant="outline">
      <Link href="/hr">Back to HR hub</Link>
    </Button>
  </div>
);

export default async function HrDocumentDetailPage({
  params,
}: DocumentDetailPageProps): Promise<ReactElement> {
  const { documentId } = await params;
  const document = await loadHrDocumentDetailPageData(documentId);

  if (document.status === "forbidden") {
    return (
      <>
        <MetadataFeatureShell
          featureId={HR_DOCUMENTS_FEATURE_ID}
          forbiddenDescription="Document detail visibility requires tenant-scoped document read access."
          forbiddenTitle="Document unavailable"
          state="forbidden"
        />
        {renderNavigationActions()}
      </>
    );
  }

  if (document.status === "error") {
    return (
      <>
        <MetadataFeatureShell
          error={document.message}
          featureId={HR_DOCUMENTS_FEATURE_ID}
          state="error"
        />
        {renderNavigationActions()}
      </>
    );
  }

  const { data } = document;
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
    <DocumentDetailView
      context={context}
      customizationLayers={customizations}
      data={data}
      metadata={hrDocumentEntityMetadata}
    />
  );
}
