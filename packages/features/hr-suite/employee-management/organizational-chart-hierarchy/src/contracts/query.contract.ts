import {
  hrOrgAuditQuerySchema,
  hrOrgPositionQuerySchema,
  hrOrgReportingRelationshipQuerySchema,
  hrOrgUnitQuerySchema,
} from "../schema.ts";
import type { HrOrgStatus, HrOrgUnitType } from "./domain.contract.ts";

export type HrOrgListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  tenantId?: string;
  companyId?: string;
  locationCode?: string;
  legalEntityCode?: string;
};

export type ListHrOrgUnitsQuery = HrOrgListQuery & {
  unitType?: HrOrgUnitType;
  status?: HrOrgStatus;
};

export type ListHrOrgPositionsQuery = HrOrgListQuery & {
  organizationUnitId?: string;
  status?: HrOrgStatus;
};

export type ListHrOrgReportingRelationshipsQuery = HrOrgListQuery & {
  employeeId?: string;
  managerEmployeeId?: string;
};

export type ListHrOrgAuditQuery = HrOrgListQuery & {
  action?: string;
};

export const listHrOrgUnitsQuerySchema: typeof hrOrgUnitQuerySchema =
  hrOrgUnitQuerySchema;

export const listHrOrgPositionsQuerySchema: typeof hrOrgPositionQuerySchema =
  hrOrgPositionQuerySchema;

export const listHrOrgReportingRelationshipsQuerySchema: typeof hrOrgReportingRelationshipQuerySchema =
  hrOrgReportingRelationshipQuerySchema;

export const listHrOrgAuditQuerySchema: typeof hrOrgAuditQuerySchema =
  hrOrgAuditQuerySchema;

export type {
  HrOrgAuditQuery,
  HrOrgPositionQuery,
  HrOrgReportingRelationshipQuery,
  HrOrgUnitQuery,
} from "../schema.ts";
