import "server-only";

import {
  archiveHrEmployeeRecordAction,
  createHrEmployeeRecordAction,
  recordHrEmployeeAssignmentAction,
  rehireHrEmployeeAction,
  updateHrEmployeeRecordAction,
} from "./actions.server.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { hrRecordsStore } from "./records-store.ts";
import { syncHrEmployeeRecordSearchDocument } from "./search.ts";

type HrRecordsMutationContext = {
  organizationId?: string;
};

const syncSearchAfterMutation = async (
  result:
    | { ok: true; message?: string; targetId?: string }
    | { ok: false; error: string },
  context?: HrRecordsMutationContext
): Promise<typeof result> => {
  if (!(result.ok && result.targetId)) {
    return result;
  }

  const record = hrRecordsStore.get(result.targetId, {
    organizationId: context?.organizationId,
  });

  if (!record) {
    return result;
  }

  try {
    await syncHrEmployeeRecordSearchDocument(record, context);
    return result;
  } catch (error) {
    return {
      ...result,
      message: `Search sync skipped: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

export const archiveHrEmployeeRecord = (
  ...args: Parameters<typeof archiveHrEmployeeRecordAction>
): Promise<ReturnType<typeof archiveHrEmployeeRecordAction>> =>
  runHrSuiteFeatureAction(async () =>
    syncSearchAfterMutation(archiveHrEmployeeRecordAction(...args), args[1])
  );

export const createHrEmployeeRecord = (
  ...args: Parameters<typeof createHrEmployeeRecordAction>
): Promise<ReturnType<typeof createHrEmployeeRecordAction>> =>
  runHrSuiteFeatureAction(async () =>
    syncSearchAfterMutation(createHrEmployeeRecordAction(...args), args[1])
  );

export const recordHrEmployeeAssignment = (
  ...args: Parameters<typeof recordHrEmployeeAssignmentAction>
): ReturnType<typeof recordHrEmployeeAssignmentAction> =>
  runHrSuiteFeatureAction(() => recordHrEmployeeAssignmentAction(...args));

export const rehireHrEmployeeRecord = (
  ...args: Parameters<typeof rehireHrEmployeeAction>
): Promise<ReturnType<typeof rehireHrEmployeeAction>> =>
  runHrSuiteFeatureAction(async () =>
    syncSearchAfterMutation(rehireHrEmployeeAction(...args), args[1])
  );

export const updateHrEmployeeRecord = (
  ...args: Parameters<typeof updateHrEmployeeRecordAction>
): Promise<ReturnType<typeof updateHrEmployeeRecordAction>> =>
  runHrSuiteFeatureAction(async () =>
    syncSearchAfterMutation(updateHrEmployeeRecordAction(...args), args[1])
  );
