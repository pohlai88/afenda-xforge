import type {
  PermissionContext,
  PermissionDecision,
  PermissionKey,
  PermissionRequirement,
} from "./contract.ts";
import { resolvePermissionDecision } from "./policy.ts";

export type PermissionProviderContext = PermissionContext & {
  requiredPermissions: PermissionRequirement;
};

export type PermissionProvider = {
  assess: (
    context: PermissionProviderContext
  ) => Promise<PermissionDecision> | PermissionDecision;
};

export const createStaticPermissionProvider = (): PermissionProvider => ({
  assess: async (
    context: PermissionProviderContext
  ): Promise<PermissionDecision> =>
    resolvePermissionDecision(context, context.requiredPermissions),
});

export const createNoopPermissionProvider = (): PermissionProvider => ({
  assess: async (
    context: PermissionProviderContext
  ): Promise<PermissionDecision> => ({
    allow: false,
    reason: "permission-provider-not-configured",
    required: context.requiredPermissions,
    missing:
      context.requiredPermissions.allOf ??
      context.requiredPermissions.anyOf ??
      [],
  }),
});

export const createPermissionGrantSet = (
  permissions: Iterable<PermissionKey>
): Set<PermissionKey> => new Set(permissions);
