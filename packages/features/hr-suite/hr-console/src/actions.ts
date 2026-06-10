import "server-only";

import {
  executeGrantHrDelegation,
  executeRevokeHrDelegation,
} from "./execution/index.ts";
import { listHrDelegationGrants } from "./delegation.ts";
import { hrConsoleCapabilities } from "./feature-scope.ts";
import { assertHrConsoleMutationAllowed } from "./governance.ts";
import { buildHrConsoleAccessContext } from "./queries.ts";
import type {
  GrantHrDelegationCommand,
  HrConsoleScope,
  HrDelegationGrant,
  ModuleConsoleOperatorAssignmentSnapshot,
  RevokeHrDelegationCommand,
} from "./schema.ts";

export const listHrConsoleDelegationGrants = async (
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<HrDelegationGrant[]> => {
  const access = await buildHrConsoleAccessContext(context, operatorAssignments);

  assertHrConsoleMutationAllowed(access, [
    hrConsoleCapabilities.delegationRead,
  ]);

  return listHrDelegationGrants(context.tenantId, context.companyId);
};

export const grantHrConsoleDelegation = (
  input: GrantHrDelegationCommand,
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<HrDelegationGrant> =>
  executeGrantHrDelegation(input, {
    operatorAssignments,
    scope: context,
  });

export const revokeHrConsoleDelegation = (
  input: RevokeHrDelegationCommand,
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<HrDelegationGrant> =>
  executeRevokeHrDelegation(input, {
    operatorAssignments,
    scope: context,
  });

export { resolveHrConsoleLamCapabilities, assertHrConsoleLamWriteAllowed, hrConsoleLamWriteCapability } from "./actions-lam.ts";
