import type { EmployeeLifecycleManagementMetadata } from "./contracts/index.ts";
import { employeeLifecycleManagementFeatureScope } from "./feature-scope.ts";
import {
  employeeLifecycleManagementFeatureId,
  employeeLifecycleManagementFeatureLabel,
} from "./identity.ts";

export const employeeLifecycleManagementMetadata: EmployeeLifecycleManagementMetadata =
  {
    id: employeeLifecycleManagementFeatureId,
    title: employeeLifecycleManagementFeatureLabel,
    description:
      "Governed metadata for the employee lifecycle management feature extracted from the legacy HR Suite.",
    domain: employeeLifecycleManagementFeatureScope.domain,
    labels: {
      singular: "employee lifecycle record",
      plural: "employee lifecycle records",
    },
    source: employeeLifecycleManagementFeatureScope.source,
    suite: employeeLifecycleManagementFeatureScope.suite,
    tags: ["hr", "employee-management", "lifecycle", "workflow"],
    keywords: [
      "onboarding",
      "probation",
      "confirmation",
      "transfer",
      "termination",
    ],
    icon: "workflow",
    maturity: "experimental",
    visibility: "internal",
    version: 1,
  };
