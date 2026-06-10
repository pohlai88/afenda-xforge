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

export const buildLamManagerTeamApproveContext = (
  base: LamMutationContext,
  teamEmployeeIds: readonly string[] = ["emp-001"],
  actorEmployeeId = "mgr-001"
): LamMutationContext => ({
  ...base,
  actorEmployeeId,
  resolvedStepApproverEmployeeIds: [actorEmployeeId],
  teamEmployeeIds,
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
