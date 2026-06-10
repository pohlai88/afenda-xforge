import { permissionCatalog } from "@repo/permissions";
import { buildHrConsoleAccessContext } from "./queries.ts";
import { HR_CONSOLE_ID, resolveModuleConsoleAccess } from "./governance.ts";
import type {
  HrConsoleScope,
  ModuleConsoleOperatorAssignmentSnapshot,
} from "./schema.ts";

export const resolveHrConsoleLamCapabilities = async (
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
) => {
  const access = await buildHrConsoleAccessContext(context, operatorAssignments);

  return {
    access,
    consoleId: HR_CONSOLE_ID,
  };
};

export const assertHrConsoleLamWriteAllowed = (
  access: Awaited<ReturnType<typeof resolveModuleConsoleAccess>>,
  capability: string
): void => {
  if (
    !access.canDomainWrite ||
    !access.grantedCapabilities.includes(capability)
  ) {
    throw new Error(`LAM write denied for capability: ${capability}`);
  }
};

export const hrConsoleLamWriteCapability =
  permissionCatalog.hrLam.leaveTypesWrite;
