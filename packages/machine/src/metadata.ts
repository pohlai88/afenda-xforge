export const machineAiFeatureFlags = [
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
] as const;

export type MachineAiFeatureFlag = (typeof machineAiFeatureFlags)[number];
