import type { LamMutationContext } from "../src/execution.ts";

export const buildLamStepApproverContext = (
  base: LamMutationContext,
  actorEmployeeId: string,
  resolvedStepApproverEmployeeIds: readonly string[] = [actorEmployeeId]
): LamMutationContext => ({
  ...base,
  actorEmployeeId,
  resolvedStepApproverEmployeeIds,
});

export const buildLamHrFallbackApproverContext = (
  base: LamMutationContext,
  actorEmployeeId: string,
  resolvedHrFallbackApproverEmployeeIds: readonly string[] = [actorEmployeeId],
  resolvedStepApproverEmployeeIds: readonly string[] = []
): LamMutationContext => ({
  ...base,
  actorEmployeeId,
  hrFallbackDelegated: true,
  resolvedHrFallbackApproverEmployeeIds,
  resolvedStepApproverEmployeeIds,
});
