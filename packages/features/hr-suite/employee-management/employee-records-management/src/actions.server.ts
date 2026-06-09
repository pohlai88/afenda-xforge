import "server-only";

import { toHrRecordsActionFailure } from "./action-result.shared.ts";
import { hrRecordsAuditActions } from "./events.ts";
import {
  hrRecordsArchiveEmployeeSchema,
  hrRecordsAssignmentSchema,
  hrRecordsCreateEmployeeSchema,
  hrRecordsRehireEmployeeSchema,
  hrRecordsUpdateEmployeeSchema,
} from "./form.shared.ts";
import {
  requireHrEmployeeSensitiveMutationAccess,
  requireHrRecordsWrite,
} from "./policy.ts";
import type {
  HrRecordsActionResult,
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsCreateEmployeeInput,
  HrRecordsRehireEmployeeInput,
  HrRecordsUpdateEmployeeInput,
} from "./records.contract.ts";
import { hrRecordsStore } from "./records-store.ts";

type HrRecordsActionContext = {
  canWrite?: boolean;
  organizationId?: string;
  userId?: string;
};

export function createHrEmployeeRecordAction(
  input: HrRecordsCreateEmployeeInput,
  context: HrRecordsActionContext
): HrRecordsActionResult {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsCreateEmployeeSchema.parse(input);
    const sensitiveAccess = requireHrEmployeeSensitiveMutationAccess(
      context,
      parsed
    );
    if (!sensitiveAccess.ok) {
      return sensitiveAccess;
    }
    const record = hrRecordsStore.create(parsed, context);
    return { ok: true, targetId: record.id };
  } catch (error) {
    return toHrRecordsActionFailure(error);
  }
}

export function updateHrEmployeeRecordAction(
  input: HrRecordsUpdateEmployeeInput,
  context: HrRecordsActionContext
): HrRecordsActionResult {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsUpdateEmployeeSchema.parse(input);
    const sensitiveAccess = requireHrEmployeeSensitiveMutationAccess(
      context,
      parsed
    );
    if (!sensitiveAccess.ok) {
      return sensitiveAccess;
    }
    const record = hrRecordsStore.update(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toHrRecordsActionFailure(error);
  }
}

export function archiveHrEmployeeRecordAction(
  input: HrRecordsArchiveEmployeeInput,
  context: HrRecordsActionContext
): HrRecordsActionResult {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsArchiveEmployeeSchema.parse(input);
    const record = hrRecordsStore.archive(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toHrRecordsActionFailure(error);
  }
}

export function recordHrEmployeeAssignmentAction(
  input: HrRecordsAssignmentInput,
  context: HrRecordsActionContext
): HrRecordsActionResult {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsAssignmentSchema.parse(input);
    const record = hrRecordsStore.assign(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toHrRecordsActionFailure(error);
  }
}

export function rehireHrEmployeeAction(
  input: HrRecordsRehireEmployeeInput,
  context: HrRecordsActionContext
): HrRecordsActionResult {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsRehireEmployeeSchema.parse(input);
    const sensitiveAccess = requireHrEmployeeSensitiveMutationAccess(
      context,
      parsed
    );
    if (!sensitiveAccess.ok) {
      return sensitiveAccess;
    }
    const record = hrRecordsStore.rehire(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toHrRecordsActionFailure(error);
  }
}

export const hrRecordsAuditActionByMutation = {
  create: hrRecordsAuditActions.employee.created,
  update: hrRecordsAuditActions.employee.updated,
  archive: hrRecordsAuditActions.employee.archived,
  assignment: hrRecordsAuditActions.assignment.recorded,
  rehire: hrRecordsAuditActions.employee.rehired,
} as const;
