import "server-only";

import {
  resolveAuthUserIdByEmployeeIdFromStore,
  resolveEmployeeIdByAuthUserIdFromStore,
} from "../employee-user-link.repository.ts";

export {
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  seedEmployeeUserAccountLinkForTests,
  setEmployeeUserAccountRepositoryPathForTesting,
} from "../employee-user-link.repository.ts";

export const resolveEmployeeIdByAuthUserId = resolveEmployeeIdByAuthUserIdFromStore;
export const resolveAuthUserIdByEmployeeId = resolveAuthUserIdByEmployeeIdFromStore;
