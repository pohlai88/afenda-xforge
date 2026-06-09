import type { HrEmployeeRecordDetail } from "../hr.workforce.records.contract.ts";
import {
  maskHrEmployeeSensitiveAddress,
  maskHrEmployeeSensitiveDateOfBirth,
  maskHrEmployeeSensitiveEmail,
  maskHrEmployeeSensitiveIdentity,
  maskHrEmployeeSensitivePhone,
} from "../hr.workforce.records-sensitive-access.shared.ts";

type HrEmployeeRecordDetailDateKeys =
  | "contractEndDate"
  | "contractStartDate"
  | "createdAt"
  | "dateOfBirth"
  | "employmentStartDate"
  | "updatedAt";

export type HrEmployeeRecordDetailView = Omit<
  HrEmployeeRecordDetail,
  | HrEmployeeRecordDetailDateKeys
  | "email"
  | "identityNumber"
  | "mailingAddress"
  | "personalEmail"
  | "phoneNumber"
  | "residentialAddress"
  | "emergencyContactPhoneNumber"
> & {
  contractEndDate: string;
  contractStartDate: string;
  createdAt: string;
  dateOfBirth: string;
  email: string;
  employmentStartDate: string;
  identityNumber: string;
  mailingAddress: string;
  personalEmail: string;
  phoneNumber: string;
  residentialAddress: string;
  updatedAt: string;
  emergencyContactPhoneNumber: string;
};

const toIsoDate = (value: Date | null): string =>
  value ? value.toISOString() : "";

export function projectHrEmployeeRecordDetail(
  record: HrEmployeeRecordDetail,
  canViewSensitive: boolean
): HrEmployeeRecordDetailView {
  return {
    ...record,
    contractEndDate: toIsoDate(record.contractEndDate),
    contractStartDate: toIsoDate(record.contractStartDate),
    createdAt: record.createdAt.toISOString(),
    dateOfBirth: maskHrEmployeeSensitiveDateOfBirth(
      record.dateOfBirth,
      canViewSensitive
    ),
    email: maskHrEmployeeSensitiveEmail(record.email, canViewSensitive),
    employmentStartDate: toIsoDate(record.employmentStartDate),
    identityNumber: maskHrEmployeeSensitiveIdentity(
      record.identityNumber,
      canViewSensitive
    ),
    mailingAddress: maskHrEmployeeSensitiveAddress(
      record.mailingAddress,
      canViewSensitive
    ),
    personalEmail: maskHrEmployeeSensitiveEmail(
      record.personalEmail,
      canViewSensitive
    ),
    phoneNumber: maskHrEmployeeSensitivePhone(
      record.phoneNumber,
      canViewSensitive
    ),
    residentialAddress: maskHrEmployeeSensitiveAddress(
      record.residentialAddress,
      canViewSensitive
    ),
    updatedAt: record.updatedAt.toISOString(),
    emergencyContactPhoneNumber: maskHrEmployeeSensitivePhone(
      record.emergencyContactPhoneNumber,
      canViewSensitive
    ),
  } satisfies HrEmployeeRecordDetailView;
}
