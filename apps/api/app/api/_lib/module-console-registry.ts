import "server-only";

import { bootstrapModuleConsoleRegistry } from "@repo/features-system-admin-control-plane/server";
import { hrConsoleModuleRegistration } from "@repo/features-hr-suite-hr-console/manifest";

let initialized = false;

export const ensureModuleConsoleRegistry = (): void => {
  if (initialized) {
    return;
  }

  bootstrapModuleConsoleRegistry([hrConsoleModuleRegistration]);
  initialized = true;
};
