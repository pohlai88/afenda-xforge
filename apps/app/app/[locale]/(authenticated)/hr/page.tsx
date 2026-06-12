import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { MetadataFeatureShell } from "../../../_components/metadata-feature-shell.tsx";
import { createAppMetadataContext } from "../../../_lib/metadata-context.ts";
import { loadHrHubPageData } from "./_data.ts";
import { HrHubView } from "./hr-hub-view.tsx";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

const renderNavigationActions = (): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Button asChild variant="outline">
      <Link href="/dashboard">Back to dashboard</Link>
    </Button>
  </div>
);

export default async function HrHubPage(): Promise<ReactElement> {
  const hub = await loadHrHubPageData();

  if (hub.status === "forbidden") {
    return (
      <>
        <MetadataFeatureShell
          featureId={HR_DOCUMENTS_FEATURE_ID}
          forbiddenDescription="The HR hub requires tenant-scoped document read access. Contact your administrator if you need HR operator permissions."
          forbiddenTitle="HR hub unavailable"
          state="forbidden"
        />
        {renderNavigationActions()}
      </>
    );
  }

  if (hub.status === "error") {
    return (
      <>
        <MetadataFeatureShell
          error={hub.message}
          featureId={HR_DOCUMENTS_FEATURE_ID}
          state="error"
        />
        {renderNavigationActions()}
      </>
    );
  }

  const context = createAppMetadataContext({
    featureId: HR_DOCUMENTS_FEATURE_ID,
    permissions: hub.data.grantedPermissions,
    tenantId: hub.data.tenantId,
    userId: hub.data.actorId,
  });

  return (
    <HrHubView
      context={context}
      data={hub.data}
      metadata={hrDocumentEntityMetadata}
    />
  );
}
