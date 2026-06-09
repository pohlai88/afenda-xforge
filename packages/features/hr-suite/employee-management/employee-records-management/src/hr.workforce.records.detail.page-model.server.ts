import "server-only";
import type { HrEmployeeRecordDetail } from "./hr.workforce.records.contract.ts";
import { hrRecordsStore } from "./hr.workforce.records.store.ts";
import { hrEmployeeDetailRoutePath } from "./hr.workforce.records-route.contract.ts";
import {
  maskHrEmployeeSensitiveAddress,
  maskHrEmployeeSensitiveDateOfBirth,
  maskHrEmployeeSensitiveEmail,
  maskHrEmployeeSensitiveIdentity,
  maskHrEmployeeSensitivePhone,
} from "./hr.workforce.records-sensitive-access.shared.ts";

export type HrEmployeeRecordDetailPageModelInput = {
  organizationId: string;
  employeeId: string;
  canViewSensitive: boolean;
};

type HrEmployeeRecordDetailPageModel = {
  routePath: string;
  employee: Omit<
    HrEmployeeRecordDetail,
    | "dateOfBirth"
    | "email"
    | "identityNumber"
    | "mailingAddress"
    | "phoneNumber"
    | "residentialAddress"
  > & {
    dateOfBirth: string;
    email: string;
    identityNumber: string;
    mailingAddress: string;
    phoneNumber: string;
    residentialAddress: string;
  };
  canViewSensitive: boolean;
  organizationId: string;
};

export function buildHrEmployeeRecordDetailPageModel(
  input: HrEmployeeRecordDetailPageModelInput
): HrEmployeeRecordDetailPageModel | null {
  const detail = hrRecordsStore.get(input.employeeId);

  if (!detail) {
    return null;
  }

  return {
    routePath: hrEmployeeDetailRoutePath(input.employeeId),
    employee: {
      ...detail,
      email: maskHrEmployeeSensitiveEmail(detail.email, input.canViewSensitive),
      identityNumber: maskHrEmployeeSensitiveIdentity(
        detail.identityNumber,
        input.canViewSensitive
      ),
      phoneNumber: maskHrEmployeeSensitivePhone(
        detail.phoneNumber,
        input.canViewSensitive
      ),
      residentialAddress: maskHrEmployeeSensitiveAddress(
        detail.residentialAddress,
        input.canViewSensitive
      ),
      mailingAddress: maskHrEmployeeSensitiveAddress(
        detail.mailingAddress,
        input.canViewSensitive
      ),
      dateOfBirth: maskHrEmployeeSensitiveDateOfBirth(
        detail.dateOfBirth,
        input.canViewSensitive
      ),
    },
    canViewSensitive: input.canViewSensitive,
    organizationId: input.organizationId,
  } satisfies HrEmployeeRecordDetailPageModel;
}
