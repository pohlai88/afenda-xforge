import "server-only";

import type {
  LamLeaveBalance,
  ListLamLeaveBalancesQuery,
} from "../contracts/index.ts";
import { listLamLeaveBalancesQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import { withComputedRemainingBalance } from "../shared/balance.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readContext,
} from "./shared.ts";

const presentLeaveBalance = (balance: LamLeaveBalance): LamLeaveBalance =>
  withComputedRemainingBalance(balance);

export async function listLamLeaveBalancesRecords(
  query: ListLamLeaveBalancesQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveBalance[]> {
  const parsed = listLamLeaveBalancesQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByEmployeeDataScope(
      filterByCompany(state.leaveBalances, ctx.companyId),
      context,
      parsed.employeeId
    )
      .filter((entry) =>
        parsed.leaveTypeId ? entry.leaveTypeId === parsed.leaveTypeId : true
      )
      .filter((entry) =>
        parsed.periodYear ? entry.periodYear === parsed.periodYear : true
      )
      .map(presentLeaveBalance)
      .sort((left, right) => {
        const yearDelta = right.periodYear - left.periodYear;
        if (yearDelta !== 0) {
          return yearDelta;
        }

        return left.leaveTypeId.localeCompare(right.leaveTypeId);
      }),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveBalanceById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveBalance | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  const balance =
    filterByCompany(state.leaveBalances, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null;

  if (!(balance && canAccessLamEmployeeRecord(context, balance.employeeId))) {
    return null;
  }

  return presentLeaveBalance(balance);
}
