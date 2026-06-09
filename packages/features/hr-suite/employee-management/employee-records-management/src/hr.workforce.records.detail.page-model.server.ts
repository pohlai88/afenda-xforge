import "server-only";
import { hrRecordsStore } from "./hr.workforce.records.store.ts";
import { hrEmployeeDetailRoutePath } from "./hr.workforce.records-route.contract.ts";
import type { HrEmployeeRecordDetailView } from "./projector/record-detail.ts";
import { projectHrEmployeeRecordDetail } from "./projector/record-detail.ts";

export type HrEmployeeRecordDetailPageModelInput = {
  organizationId: string;
  employeeId: string;
  canViewSensitive: boolean;
};

type HrEmployeeRecordDetailPageModel = {
  routePath: string;
  employee: HrEmployeeRecordDetailView;
  canViewSensitive: boolean;
  organizationId: string;
};

export function buildHrEmployeeRecordDetailPageModel(
  input: HrEmployeeRecordDetailPageModelInput
): HrEmployeeRecordDetailPageModel | null {
  const detail = hrRecordsStore.get(input.employeeId, {
    organizationId: input.organizationId,
  });

  if (!detail) {
    return null;
  }

  return {
    routePath: hrEmployeeDetailRoutePath(input.employeeId),
    employee: projectHrEmployeeRecordDetail(detail, input.canViewSensitive),
    canViewSensitive: input.canViewSensitive,
    organizationId: input.organizationId,
  } satisfies HrEmployeeRecordDetailPageModel;
}
