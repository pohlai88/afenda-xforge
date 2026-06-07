import { handleAiGatewaySpendGet } from "@repo/ai/server";
import { requireActiveTenantAccess } from "@repo/auth/server";
import { createLogger, withRequestLogging } from "@repo/logger";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const gatewaySpendLogger = createLogger("app.api.ai.gateway-spend");

type AiSpendAccess = {
  actorId: string;
  grantedPermissions: string[];
  tenantId: string;
};

const resolveAiSpendAccess = async (): Promise<AiSpendAccess> => {
  const access = await requireActiveTenantAccess();

  return {
    actorId: access.user.id,
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    tenantId: access.membership.tenantId,
  };
};

const createAiSpendPermissionContext = (
  access: AiSpendAccess
): PermissionContext => ({
  action: "ai.gatewaySpend.read",
  actorId: access.actorId,
  grantedPermissions: access.grantedPermissions,
  resource: "ai",
  tenantId: access.tenantId,
});

const gatewaySpendRoute = withRequestLogging(
  async (request: Request): Promise<Response> => {
    const access = await resolveAiSpendAccess();

    requirePermission(createAiSpendPermissionContext(access), {
      allOf: [permissionCatalog.ai.read],
    });

    return handleAiGatewaySpendGet(request, {
      organizationId: access.tenantId,
    });
  },
  {
    logger: gatewaySpendLogger,
    metricsApp: "app",
  }
);

export const GET: typeof gatewaySpendRoute = gatewaySpendRoute;
