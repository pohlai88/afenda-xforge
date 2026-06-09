import type { MetadataRenderMode } from "./render-context.contract";

export type MetadataConsumerScenarioDefinition = {
  expectedDisabled: boolean;
  featureFlags?: Readonly<Record<string, boolean>>;
  id:
    | "create-ready"
    | "read-ready"
    | "update-ready"
    | "review-ready"
    | "readonly-review"
    | "feature-flag-denied";
  mode: MetadataRenderMode;
  permissions?: Readonly<Record<string, boolean>>;
  readonly?: boolean;
};

export type MetadataConsumerScenarioResult = {
  containsActionLabel: boolean;
  containsDisabledControl: boolean;
  formText: string;
  id: MetadataConsumerScenarioDefinition["id"];
  mode: MetadataRenderMode;
  readonly: boolean;
  sectionText: string;
  stateText: string;
};
