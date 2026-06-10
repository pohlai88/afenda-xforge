import "server-only";

import type {
  OffboardingCaseRecord,
  OpenOffboardingCaseInput,
  UpdateOffboardingCaseInput,
} from "./contracts/index.ts";
import {
  openOffboardingCaseInputSchema,
  updateOffboardingCaseInputSchema,
} from "./contracts/index.ts";
import { runOffboardingExitManagementAction } from "./execution.ts";
import type { HrSuiteFeatureContext } from "./feature-scope.ts";
import {
  matchesOffboardingScope,
  requireOffboardingWriteScope,
} from "./policy.ts";
import { projectOffboardingCase } from "./projector/case.ts";
import {
  createOffboardingCaseRecordId,
  mutateOffboardingRepository,
} from "./repository.ts";

const normalizeCaseTitle = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Untitled offboarding case";
};

const buildOffboardingCaseNumber = (id: string): string =>
  `OFF-${id.slice(0, 8).toUpperCase()}`;

export async function openOffboardingCase(
  input: OpenOffboardingCaseInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingCaseRecord> {
  return await runOffboardingExitManagementAction(async () => {
    const parsedInput = openOffboardingCaseInputSchema.parse(input);
    const resolvedScope = requireOffboardingWriteScope(context);
    const id = createOffboardingCaseRecordId();
    const now = new Date();

    const record: OffboardingCaseRecord = {
      id,
      caseNumber: buildOffboardingCaseNumber(id),
      caseTitle: normalizeCaseTitle(parsedInput.caseTitle),
      employeeId: parsedInput.employeeId,
      tenantId: resolvedScope.tenantId,
      companyId: resolvedScope.companyId,
      status: "draft",
      exitType: parsedInput.exitType ?? parsedInput.lifecycleTrigger.exitType,
      lifecycleTrigger: parsedInput.lifecycleTrigger,
      effectiveSeparationDate:
        parsedInput.lifecycleTrigger.effectiveSeparationDate,
      lastWorkingDate: parsedInput.lifecycleTrigger.lastWorkingDate,
      noticeStartDate: parsedInput.lifecycleTrigger.noticeStartDate,
      noticeEndDate: parsedInput.lifecycleTrigger.noticeEndDate,
      coordinatorActorId: parsedInput.coordinatorActorId,
      requestedByActorId: context?.actorId ?? parsedInput.requestedByActorId,
      reasonSummary: parsedInput.reasonSummary,
      createdAt: now,
      updatedAt: now,
    };

    await mutateOffboardingRepository((draft) => {
      const duplicate = draft.cases.find(
        (existingRecord) =>
          matchesOffboardingScope(existingRecord, resolvedScope) &&
          existingRecord.lifecycleTrigger.sourceLifecycleEventId ===
            record.lifecycleTrigger.sourceLifecycleEventId
      );

      if (duplicate) {
        throw new Error(
          `Offboarding case already exists for lifecycle event ${record.lifecycleTrigger.sourceLifecycleEventId}.`
        );
      }

      draft.cases = [...draft.cases, record];
    }, resolvedScope);

    return projectOffboardingCase(record);
  });
}

export async function updateOffboardingCase(
  input: UpdateOffboardingCaseInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingCaseRecord> {
  return await runOffboardingExitManagementAction(async () => {
    const parsedInput = updateOffboardingCaseInputSchema.parse(input);
    const resolvedScope = requireOffboardingWriteScope(context);
    let nextRecord: OffboardingCaseRecord | null = null;

    await mutateOffboardingRepository((draft) => {
      const currentRecordIndex = draft.cases.findIndex(
        (existingRecord) =>
          existingRecord.id === parsedInput.id &&
          matchesOffboardingScope(existingRecord, resolvedScope)
      );

      if (currentRecordIndex < 0) {
        throw new Error(
          `Offboarding case ${parsedInput.id} could not be found for update.`
        );
      }

      const currentRecord = draft.cases[currentRecordIndex];
      nextRecord = {
        ...currentRecord,
        caseTitle: normalizeCaseTitle(
          parsedInput.caseTitle ?? currentRecord.caseTitle
        ),
        status: parsedInput.status ?? currentRecord.status,
        coordinatorActorId:
          parsedInput.coordinatorActorId ?? currentRecord.coordinatorActorId,
        reasonSummary: parsedInput.reasonSummary ?? currentRecord.reasonSummary,
        rehireEligibility:
          parsedInput.rehireEligibility ?? currentRecord.rehireEligibility,
        updatedAt: new Date(),
      };

      draft.cases = draft.cases.map((record) =>
        record.id === nextRecord?.id ? nextRecord : record
      );
    }, resolvedScope);

    if (!nextRecord) {
      throw new Error(
        `Offboarding case ${parsedInput.id} could not be found for update.`
      );
    }

    return projectOffboardingCase(nextRecord);
  });
}

export const createOffboardingExitManagementRecord = openOffboardingCase;

export const updateOffboardingExitManagementRecord = updateOffboardingCase;
