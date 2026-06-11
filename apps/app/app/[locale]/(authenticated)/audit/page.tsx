import { auditEventMetadata } from "@repo/features-system-admin-control-plane/metadata/audit-event";
import type { ReactElement } from "react";
import { MetadataFeatureShell } from "../../../_components/metadata-feature-shell.tsx";
import { createAppMetadataContext } from "../../../_lib/metadata-context.ts";
import {
  loadEntityMetadataCustomizations,
} from "../../../_lib/metadata-customizations.ts";
import { AuditView } from "./audit-view.tsx";
import { loadAuditPageData } from "./_data.ts";

const AUDIT_FEATURE_ID = "system-admin.audit";

export default async function AuditPage(): Promise<ReactElement> {
  const audit = await loadAuditPageData();

  if (audit.status === "forbidden") {
    return (
      <MetadataFeatureShell
        featureId={AUDIT_FEATURE_ID}
        forbiddenDescription="Audit visibility requires the audit.read permission for this tenant."
        forbiddenTitle="Audit unavailable"
        state="forbidden"
      />
    );
  }

  if (audit.status === "error") {
    return (
      <MetadataFeatureShell
        error={audit.message}
        featureId={AUDIT_FEATURE_ID}
        state="error"
      />
    );
  }

  const { data } = audit;
  const customizations = await loadEntityMetadataCustomizations({
    tenantId: data.tenantId,
  });
  const context = createAppMetadataContext({
    featureId: AUDIT_FEATURE_ID,
    permissions: data.grantedPermissions,
    tenantId: data.tenantId,
    userId: data.actorId,
  });

  return (
    <AuditView
      context={context}
      customizationLayers={customizations}
      data={data}
      metadata={auditEventMetadata}
    />
  );
}
