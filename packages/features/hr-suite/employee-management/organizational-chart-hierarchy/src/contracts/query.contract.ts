import {
  hrOrgAuditQuerySchema,
  hrOrgHeadcountQuerySchema,
  hrOrgPositionQuerySchema,
  hrOrgReportingRelationshipQuerySchema,
  hrOrgVacancyQuerySchema,
  hrOrgUnitQuerySchema,
} from "../schema.ts";
import type {
  HrOrgHeadcountQuery,
  HrOrgReportingRelationshipType,
  HrOrgRepositoryEntityType,
  HrOrgStatus,
  HrOrgUnitType,
  HrOrgVacancyQuery,
} from "./domain.contract.ts";

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
  relationshipType?: HrOrgReportingRelationshipType;
};

export type ListHrOrgVacanciesQuery = HrOrgListQuery & {
  organizationUnitId?: string;
  positionId?: string;
  status?: HrOrgStatus;
};

export type ListHrOrgHeadcountQuery = HrOrgListQuery & {
  organizationUnitId?: string;
};

export type ListHrOrgAuditQuery = HrOrgListQuery & {
  action?: string;
  entityType?: HrOrgRepositoryEntityType;
};

export const listHrOrgUnitsQuerySchema: typeof hrOrgUnitQuerySchema =
  hrOrgUnitQuerySchema;

export const listHrOrgPositionsQuerySchema: typeof hrOrgPositionQuerySchema =
  hrOrgPositionQuerySchema;

export const listHrOrgReportingRelationshipsQuerySchema: typeof hrOrgReportingRelationshipQuerySchema =
  hrOrgReportingRelationshipQuerySchema;

export const listHrOrgVacanciesQuerySchema: typeof hrOrgVacancyQuerySchema =
  hrOrgVacancyQuerySchema;

export const listHrOrgHeadcountQuerySchema: typeof hrOrgHeadcountQuerySchema =
  hrOrgHeadcountQuerySchema;

export const listHrOrgAuditQuerySchema: typeof hrOrgAuditQuerySchema =
  hrOrgAuditQuerySchema;

export type {
  HrOrgAuditQuery,
  HrOrgHeadcountQuery,
  HrOrgPositionQuery,
  HrOrgReportingRelationshipQuery,
  HrOrgUnitQuery,
  HrOrgVacancyQuery,
} from "../schema.ts";
