import type { ReactElement } from "react";
import { createAppMetadataContext } from "../../../_lib/metadata-context.ts";
import { resolveRuntimeTenantAccess } from "../../../_runtime-access.ts";
import { AssistantView } from "./assistant-view.tsx";

const ASSISTANT_FEATURE_ID = "system-admin.overview";

export default async function AssistantPage(): Promise<ReactElement> {
  const access = await resolveRuntimeTenantAccess();
  const context = createAppMetadataContext({
    featureId: ASSISTANT_FEATURE_ID,
    permissions: access.grantedPermissions,
    tenantId: access.tenantId,
    userId: access.actorId,
  });

  return <AssistantView context={context} />;
}
