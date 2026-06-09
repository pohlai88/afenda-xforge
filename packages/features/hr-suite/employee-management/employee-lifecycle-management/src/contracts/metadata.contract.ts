import type { EmployeeLifecycleManagementFeatureScope } from "../feature-scope.ts";
import type { EmployeeLifecycleManagementFeatureId } from "../identity.ts";

export type EmployeeLifecycleManagementMetadata = {
  id: EmployeeLifecycleManagementFeatureId;
  title: string;
  description: string;
  domain: EmployeeLifecycleManagementFeatureScope["domain"];
  labels: {
    singular: string;
    plural: string;
  };
  source: EmployeeLifecycleManagementFeatureScope["source"];
  suite: EmployeeLifecycleManagementFeatureScope["suite"];
  tags: readonly string[];
  keywords: readonly string[];
  icon: string;
  maturity: "experimental" | "managed" | "enterprise";
  visibility: "internal" | "restricted" | "public";
  version: 1;
};
