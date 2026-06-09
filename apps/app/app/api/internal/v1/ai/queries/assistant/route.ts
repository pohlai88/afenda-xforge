import { createContractRoute } from "@repo/api/route";
import { getActiveCompanyGrant } from "@repo/auth/server";
import { createLogger } from "@repo/logger";
import { classifyXforgeIntent } from "@repo/machine/client";
import type { MachineAssistantRequest } from "@repo/machine/contract";
import { machineAssistantRouteContract } from "@repo/machine/contract";
import {
  createXforgeAssistantRegistry,
  createXforgeMachine,
  defaultXforgeAssistants,
} from "@repo/machine/server";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../../../../../_runtime-access.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const assistantLogger = createLogger("app.api.ai.assistant");

const resolveAssistantModules = (
  body: MachineAssistantRequest
): typeof defaultXforgeAssistants =>
  body.module
    ? defaultXforgeAssistants.filter(
        (assistant) => assistant.module === body.module
      )
    : defaultXforgeAssistants;

const assistantRoute = createContractRoute(
  machineAssistantRouteContract,
  async (request) => {
    const body = request.body as MachineAssistantRequest | undefined;

    if (!body) {
      throw new Error("AI assistant request body was not resolved");
    }

    const access = await resolveRuntimeTenantAccess();

    requirePermission(
      createRuntimePermissionContext(access, "ai.assistant.chat", "ai"),
      {
        allOf: [permissionCatalog.ai.read],
      }
    );

    const companyGrant = await getActiveCompanyGrant();
    const intent = classifyXforgeIntent(body.message);
    const selectedModule = body.module ?? intent.module;
    const assistantModules = resolveAssistantModules(body);
    const assistantRegistry = createXforgeAssistantRegistry(assistantModules);
    const assistant = assistantRegistry.resolve(selectedModule);
    const machine = createXforgeMachine({
      assistants: assistantModules,
      enabledModules: assistantModules.map(
        (assistantModule) => assistantModule.module
      ),
    });
    const result = await machine.chat({
      context: {
        companyId: companyGrant?.companyId,
        grantedPermissions: access.grantedPermissions,
        history: body.history,
        module: selectedModule,
        tenantId: access.tenantId,
        userId: access.actorId,
      },
      message: body.message,
    });

    return {
      data: {
        assistant: assistant.name,
        intentConfidence: intent.confidence,
        module: selectedModule,
        response: result.text,
      },
    };
  },
  {
    logger: assistantLogger,
    metricsApp: "app",
  }
);

export const POST: typeof assistantRoute = assistantRoute;
