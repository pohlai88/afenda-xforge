import "server-only";
import type {
  HrEmployeeRecordDetailView,
  HrEmployeeRecordExportView,
} from "./projector/record-detail.ts";
import {
  projectHrEmployeeRecordDetail,
  projectHrEmployeeRecordExportDetail,
} from "./projector/record-detail.ts";
import { hrRecordsStore } from "./records-store.ts";
import { hrEmployeeDetailRoutePath } from "./route-paths.ts";

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

type HrEmployeeRecordExportPageModel = {
  routePath: string;
  employee: HrEmployeeRecordExportView;
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

export function buildHrEmployeeRecordExportPageModel(
  input: Omit<HrEmployeeRecordDetailPageModelInput, "canViewSensitive">
): HrEmployeeRecordExportPageModel | null {
  const detail = hrRecordsStore.get(input.employeeId, {
    organizationId: input.organizationId,
  });

  if (!detail) {
    return null;
  }

  return {
    routePath: hrEmployeeDetailRoutePath(input.employeeId),
    employee: projectHrEmployeeRecordExportDetail(detail),
    organizationId: input.organizationId,
  } satisfies HrEmployeeRecordExportPageModel;
}
