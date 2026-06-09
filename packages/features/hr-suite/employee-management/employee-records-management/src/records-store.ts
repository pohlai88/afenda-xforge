import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsCreateEmployeeInput,
  HrRecordsRehireEmployeeInput,
  HrRecordsUpdateEmployeeInput,
} from "./records.contract.ts";
import {
  archiveHrEmployeeRecordRepository,
  assignHrEmployeeRecordRepository,
  createHrEmployeeRecordRepository,
  getHrEmployeeRecordRepository,
  listHrEmployeeAssignmentsRepository,
  listHrEmployeeRecordsRepository,
  listHrEmployeeStatusHistoryRepository,
  rehireHrEmployeeRecordRepository,
  updateHrEmployeeRecordRepository,
} from "./repository.ts";
import type {
  HrEmployeeAssignmentRecord,
  HrEmployeeStatusHistoryRecord,
} from "./schema.ts";

export type HrRecordsStoreContext = {
  canRead?: boolean;
  organizationId?: string;
  userId?: string;
};

export const hrRecordsStore = {
  list(context?: HrRecordsStoreContext): readonly HrEmployeeRecordSummary[] {
    return listHrEmployeeRecordsRepository(context);
  },
  get(
    id: string,
    context?: HrRecordsStoreContext
  ): HrEmployeeRecordDetail | null {
    return getHrEmployeeRecordRepository(id, context);
  },
  create(
    input: HrRecordsCreateEmployeeInput,
    context?: HrRecordsStoreContext
  ): HrEmployeeRecordDetail {
    return createHrEmployeeRecordRepository(input, context);
  },
  update(
    input: HrRecordsUpdateEmployeeInput,
    context?: HrRecordsStoreContext
  ): HrEmployeeRecordDetail | null {
    return updateHrEmployeeRecordRepository(input, context);
  },
  archive(
    input: HrRecordsArchiveEmployeeInput,
    context?: HrRecordsStoreContext
  ): HrEmployeeRecordDetail | null {
    return archiveHrEmployeeRecordRepository(input, context);
  },
  assign(
    input: HrRecordsAssignmentInput,
    context?: HrRecordsStoreContext
  ): HrEmployeeRecordDetail | null {
    return assignHrEmployeeRecordRepository(input, context);
  },
  listAssignments(
    context?: HrRecordsStoreContext
  ): readonly HrEmployeeAssignmentRecord[] {
    return listHrEmployeeAssignmentsRepository(context);
  },
  listStatusHistory(
    context?: HrRecordsStoreContext
  ): readonly HrEmployeeStatusHistoryRecord[] {
    return listHrEmployeeStatusHistoryRepository(context);
  },
  rehire(
    input: HrRecordsRehireEmployeeInput,
    context?: HrRecordsStoreContext
  ): HrEmployeeRecordDetail | null {
    return rehireHrEmployeeRecordRepository(input, context);
  },
};
