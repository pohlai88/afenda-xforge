import type { OffboardingExitManagementFeatureScope } from "../feature-scope.ts";
import type { OffboardingExitManagementFeatureId } from "../identity.ts";

export type OffboardingExitManagementMetadata = {
  id: OffboardingExitManagementFeatureId;
  title: string;
  description: string;
  domain: OffboardingExitManagementFeatureScope["domain"];
  labels: {
    singular: string;
    plural: string;
  };
  source: OffboardingExitManagementFeatureScope["source"];
  suite: OffboardingExitManagementFeatureScope["suite"];
  tags: readonly string[];
  keywords: readonly string[];
  icon: string;
  maturity: "experimental" | "managed" | "enterprise";
  visibility: "internal" | "restricted" | "public";
  version: 1;
};
