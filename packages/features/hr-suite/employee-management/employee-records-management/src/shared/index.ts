export type HrSuiteFeatureContext = {
  actorId?: string;
  canViewSensitive?: boolean;
  canWrite?: boolean;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
};

export {
  hrRecordsFeatureScope,
  hrSuiteFeatureScope,
} from "../feature-scope.ts";
