import "server-only";

import type { HrRecordsActionResult } from "../records.contract.ts";
import {
  listEmployeeUserAccountLinkRecords,
  upsertEmployeeUserAccountLinkRecord,
} from "../employee-user-link.repository.ts";
import type {
  EmployeeUserAccountLinkRecord,
  ListEmployeeUserAccountLinksQuery,
  UpsertEmployeeUserAccountLinkInput,
} from "../employee-user-link.schema.ts";
import {
  listEmployeeUserAccountLinksQuerySchema,
  upsertEmployeeUserAccountLinkInputSchema,
} from "../employee-user-link.schema.ts";
import { requireHrRecordsWrite } from "../policy.ts";

export type EmployeeUserAccountLinkContext = {
  canRead?: boolean;
  canWrite?: boolean;
  companyId: string;
  tenantId: string;
};

const requireEmployeeUserAccountRead = (
  context: EmployeeUserAccountLinkContext
): HrRecordsActionResult =>
  context.canRead === false
    ? { ok: false, error: "Read access denied for employee user account links" }
    : { ok: true };

export const upsertEmployeeUserAccountLink = async (
  input: UpsertEmployeeUserAccountLinkInput,
  context: EmployeeUserAccountLinkContext
): Promise<
  HrRecordsActionResult & { link?: EmployeeUserAccountLinkRecord }
> => {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const validInput = upsertEmployeeUserAccountLinkInputSchema.parse(input);
    const link = await upsertEmployeeUserAccountLinkRecord(validInput, {
      companyId: context.companyId,
      tenantId: context.tenantId,
    });

    return {
      ok: true,
      link,
      message: validInput.active === false
        ? "Employee user account link deactivated"
        : "Employee user account link saved",
      targetId: link.id,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected employee user account link mutation failure",
    };
  }
};

export const listEmployeeUserAccountLinks = async (
  query: ListEmployeeUserAccountLinksQuery,
  context: EmployeeUserAccountLinkContext
): Promise<
  HrRecordsActionResult & { links?: EmployeeUserAccountLinkRecord[] }
> => {
  const readAccess = requireEmployeeUserAccountRead(context);
  if (!readAccess.ok) {
    return readAccess;
  }

  try {
    const validQuery = listEmployeeUserAccountLinksQuerySchema.parse(query);
    const links = await listEmployeeUserAccountLinkRecords(
      {
        companyId: context.companyId,
        tenantId: context.tenantId,
      },
      validQuery
    );

    return {
      ok: true,
      links,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected employee user account link query failure",
    };
  }
};

export const deactivateEmployeeUserAccountLink = async (
  input: { userId: string },
  context: EmployeeUserAccountLinkContext
): Promise<
  HrRecordsActionResult & { link?: EmployeeUserAccountLinkRecord }
> => {
  const existing = await listEmployeeUserAccountLinkRecords(
    {
      companyId: context.companyId,
      tenantId: context.tenantId,
    },
    { userId: input.userId }
  );
  const current = existing[0];
  if (!current) {
    return {
      ok: false,
      error: "Employee user account link not found",
    };
  }

  return upsertEmployeeUserAccountLink(
    {
      active: false,
      employeeId: current.employeeId,
      userId: current.userId,
    },
    context
  );
};
