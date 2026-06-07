export const machineAiFeatureFlags = [
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
] as const;

export type MachineAiFeatureFlag = (typeof machineAiFeatureFlags)[number];

export const lynxAiFeatureFlags: typeof machineAiFeatureFlags =
  machineAiFeatureFlags;

export type LynxAiFeatureFlag = MachineAiFeatureFlag;
