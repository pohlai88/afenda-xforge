import type {
  OffboardingCaseProjection,
  OffboardingCaseRecord,
} from "../contracts/index.ts";
import { offboardingCaseProjectionSchema } from "../contracts/index.ts";

export const projectOffboardingCase = (
  record: OffboardingCaseRecord
): OffboardingCaseProjection => offboardingCaseProjectionSchema.parse(record);

export const projectOffboardingCases = (
  records: readonly OffboardingCaseRecord[]
): readonly OffboardingCaseProjection[] => records.map(projectOffboardingCase);
