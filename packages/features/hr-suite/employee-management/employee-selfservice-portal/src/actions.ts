import "server-only";

import { recordEmployeeSelfservicePortalAuditEvent } from "./audit.ts";
import { applyEmployeeSelfservicePortalApprovedProfileUpdate } from "./employee-records.integration.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import {
  canReviewEmployeeSelfservicePortalProfileUpdateRequest,
  canSubmitEmployeeSelfservicePortalProfileUpdateRequest,
  canWriteEmployeeSelfservicePortal,
} from "./policy.ts";
import { employeeSelfservicePortalAuditActions } from "./registry/audit.ts";
import {
  createEmployeeSelfservicePortalProfileUpdateRequestId,
  createEmployeeSelfservicePortalRecordId,
  getEmployeeSelfservicePortalProfileUpdateRequestById,
  getEmployeeSelfservicePortalRepositoryRecordByEmployeeId,
  getEmployeeSelfservicePortalRepositoryRecordById,
  mutateEmployeeSelfservicePortalRepository,
} from "./repository.ts";
import type {
  CreateEmployeeSelfservicePortalInput,
  CreateEmployeeSelfservicePortalProfileUpdateRequestInput,
  EmployeeSelfservicePortalProfileUpdateRequest,
  EmployeeSelfservicePortalRecord,
  RejectEmployeeSelfservicePortalProfileUpdateRequestInput,
  ReviewEmployeeSelfservicePortalProfileUpdateRequestInput,
  UpdateEmployeeSelfservicePortalInput,
} from "./schema.ts";
import {
  createEmployeeSelfservicePortalInputSchema,
  createEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  reviewEmployeeSelfservicePortalProfileUpdateRequestInputSchema,
  updateEmployeeSelfservicePortalInputSchema,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeDisplayName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unknown Employee";
};

export function createEmployeeSelfservicePortalRecord(
  input: CreateEmployeeSelfservicePortalInput,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalRecord {
  return runHrSuiteFeatureAction(() => {
    if (!canWriteEmployeeSelfservicePortal(context)) {
      throw new Error("Employee self-service portal write access denied.");
    }

    const parsedInput = createEmployeeSelfservicePortalInputSchema.parse(input);
    const timestamp = new Date();
    const tenantId = context?.tenantId;
    const companyId = context?.companyId;

    if (!(tenantId && companyId)) {
      throw new Error(
        "Employee self-service portal write scope requires tenantId and companyId."
      );
    }

    if (
      getEmployeeSelfservicePortalRepositoryRecordByEmployeeId(
        parsedInput.employeeId,
        {
          companyId,
          tenantId,
        }
      )
    ) {
      throw new Error(
        "Employee self-service portal record already exists for this employee scope."
      );
    }

    const record: EmployeeSelfservicePortalRecord = {
      id: createEmployeeSelfservicePortalRecordId(),
      tenantId,
      companyId,
      employeeId: parsedInput.employeeId,
      employeeNumber: parsedInput.employeeNumber,
      displayName: normalizeDisplayName(parsedInput.displayName),
      workEmail: parsedInput.workEmail ?? null,
      locale: parsedInput.locale ?? null,
      timeZone: parsedInput.timeZone ?? null,
      status: "invited",
      mobileAccessEnabled: parsedInput.mobileAccessEnabled ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    mutateEmployeeSelfservicePortalRepository((snapshot) => ({
      ...snapshot,
      records: [...snapshot.records, record],
    }));

    return record;
  });
}

export function updateEmployeeSelfservicePortalRecord(
  input: UpdateEmployeeSelfservicePortalInput,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalRecord {
  return runHrSuiteFeatureAction(() => {
    if (!canWriteEmployeeSelfservicePortal(context)) {
      throw new Error("Employee self-service portal write access denied.");
    }

    const parsedInput = updateEmployeeSelfservicePortalInputSchema.parse(input);
    const currentRecord = getEmployeeSelfservicePortalRepositoryRecordById(
      parsedInput.id
    );

    if (!currentRecord) {
      throw new Error("Employee self-service portal record not found.");
    }

    if (
      currentRecord.tenantId !== context?.tenantId ||
      currentRecord.companyId !== context?.companyId
    ) {
      throw new Error(
        "Employee self-service portal record is outside the current scope."
      );
    }

    const nextRecord: EmployeeSelfservicePortalRecord = {
      ...currentRecord,
      displayName: normalizeDisplayName(
        parsedInput.displayName ?? currentRecord.displayName
      ),
      workEmail:
        parsedInput.workEmail === undefined
          ? currentRecord.workEmail
          : parsedInput.workEmail,
      locale:
        parsedInput.locale === undefined
          ? currentRecord.locale
          : parsedInput.locale,
      timeZone:
        parsedInput.timeZone === undefined
          ? currentRecord.timeZone
          : parsedInput.timeZone,
      mobileAccessEnabled:
        parsedInput.mobileAccessEnabled ?? currentRecord.mobileAccessEnabled,
      status: parsedInput.status ?? currentRecord.status,
      updatedAt: new Date(),
    };

    mutateEmployeeSelfservicePortalRepository((snapshot) => ({
      ...snapshot,
      records: snapshot.records.map((record) =>
        record.id === nextRecord.id ? nextRecord : record
      ),
    }));

    return nextRecord;
  });
}

const sensitiveProfileUpdateFields = new Set([
  "emergencyContactPhoneNumber",
  "mailingAddress",
  "personalEmail",
  "phoneNumber",
  "residentialAddress",
]);

const hasSensitiveProfileUpdateFields = (
  requestedChanges: Record<string, unknown>
): boolean =>
  Object.keys(requestedChanges).some((field) =>
    sensitiveProfileUpdateFields.has(field)
  );

export function submitEmployeeSelfservicePortalProfileUpdateRequest(
  input: CreateEmployeeSelfservicePortalProfileUpdateRequestInput,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalProfileUpdateRequest {
  return runHrSuiteFeatureAction(() => {
    const parsedInput =
      createEmployeeSelfservicePortalProfileUpdateRequestInputSchema.parse(
        input
      );

    if (
      !canSubmitEmployeeSelfservicePortalProfileUpdateRequest(
        context,
        parsedInput.employeeId
      )
    ) {
      throw new Error(
        "Employee self-service profile update request submission denied."
      );
    }

    const tenantId = context?.tenantId;
    const companyId = context?.companyId;

    if (!(tenantId && companyId)) {
      throw new Error(
        "Employee self-service portal write scope requires tenantId and companyId."
      );
    }

    const portalRecord =
      getEmployeeSelfservicePortalRepositoryRecordByEmployeeId(
        parsedInput.employeeId,
        {
          companyId,
          tenantId,
        }
      );

    if (!portalRecord) {
      throw new Error(
        "Employee self-service portal record not found for the current employee scope."
      );
    }

    const timestamp = new Date();
    const request: EmployeeSelfservicePortalProfileUpdateRequest = {
      id: createEmployeeSelfservicePortalProfileUpdateRequestId(),
      tenantId,
      companyId,
      employeeId: parsedInput.employeeId,
      requestType: "profile_update",
      status: "pending_hr_review",
      requestedChanges: parsedInput.requestedChanges,
      requiresSensitiveApproval: hasSensitiveProfileUpdateFields(
        parsedInput.requestedChanges
      ),
      reason: parsedInput.reason ?? null,
      approvalReference: null,
      rejectionReason: null,
      requestedByActorId: context?.actorId ?? null,
      requestedByUserId: context?.userId ?? null,
      reviewedByUserId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      submittedAt: timestamp,
      reviewedAt: null,
    };

    mutateEmployeeSelfservicePortalRepository((snapshot) => ({
      ...snapshot,
      profileUpdateRequests: [...snapshot.profileUpdateRequests, request],
    }));

    recordEmployeeSelfservicePortalAuditEvent({
      action:
        employeeSelfservicePortalAuditActions.profileUpdateRequestSubmitted,
      after: {
        id: request.id,
        requestType: request.requestType,
        requiresSensitiveApproval: request.requiresSensitiveApproval,
        status: request.status,
      },
      context,
      employeeId: request.employeeId,
      metadata: {
        changedFields: Object.keys(request.requestedChanges),
        requestType: request.requestType,
      },
      summary: `Submitted profile update request ${request.id}`,
      targetDisplayName: request.requestType,
      targetId: request.id,
      targetType: "profile_update_request",
    });

    return request;
  });
}

export function approveEmployeeSelfservicePortalProfileUpdateRequest(
  input: ReviewEmployeeSelfservicePortalProfileUpdateRequestInput,
  context?: HrSuiteFeatureContext
): Promise<EmployeeSelfservicePortalProfileUpdateRequest> {
  return runHrSuiteFeatureAction(async () => {
    const parsedInput =
      reviewEmployeeSelfservicePortalProfileUpdateRequestInputSchema.parse(
        input
      );
    const currentRequest = getEmployeeSelfservicePortalProfileUpdateRequestById(
      parsedInput.requestId
    );

    if (!currentRequest) {
      throw new Error(
        "Employee self-service profile update request not found."
      );
    }

    if (
      !canReviewEmployeeSelfservicePortalProfileUpdateRequest(
        context,
        currentRequest
      )
    ) {
      throw new Error(
        "Employee self-service profile update request approval denied."
      );
    }

    if (currentRequest.status !== "pending_hr_review") {
      throw new Error(
        "Only pending employee self-service profile update requests can be approved."
      );
    }

    const portalRecord =
      getEmployeeSelfservicePortalRepositoryRecordByEmployeeId(
        currentRequest.employeeId,
        {
          companyId: currentRequest.companyId,
          tenantId: currentRequest.tenantId,
        }
      );

    if (!portalRecord) {
      throw new Error(
        "Employee self-service portal record not found for the current employee scope."
      );
    }

    const result = await applyEmployeeSelfservicePortalApprovedProfileUpdate({
      approvalReference: parsedInput.approvalReference ?? currentRequest.id,
      employeeId: currentRequest.employeeId,
      organizationId: context?.organizationId ?? "",
      reason:
        parsedInput.reason ??
        "Approved employee self-service profile update request",
      requestedChanges: currentRequest.requestedChanges,
      userId: context?.userId,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    const approvedTimestamp = new Date();
    const approvedRequest: EmployeeSelfservicePortalProfileUpdateRequest = {
      ...currentRequest,
      approvalReference: parsedInput.approvalReference ?? currentRequest.id,
      reviewedAt: approvedTimestamp,
      reviewedByUserId: context?.userId ?? null,
      status: "approved",
      updatedAt: approvedTimestamp,
    };

    mutateEmployeeSelfservicePortalRepository((snapshot) => ({
      ...snapshot,
      profileUpdateRequests: snapshot.profileUpdateRequests.map((request) =>
        request.id === approvedRequest.id ? approvedRequest : request
      ),
    }));

    recordEmployeeSelfservicePortalAuditEvent({
      action:
        employeeSelfservicePortalAuditActions.profileUpdateRequestApproved,
      after: {
        approvalReference: approvedRequest.approvalReference,
        id: approvedRequest.id,
        reviewedByUserId: approvedRequest.reviewedByUserId,
        status: approvedRequest.status,
      },
      before: {
        id: currentRequest.id,
        status: currentRequest.status,
      },
      context,
      employeeId: approvedRequest.employeeId,
      metadata: {
        approvalReference: approvedRequest.approvalReference,
        requestType: approvedRequest.requestType,
      },
      summary: `Approved profile update request ${approvedRequest.id}`,
      targetDisplayName: approvedRequest.requestType,
      targetId: approvedRequest.id,
      targetType: "profile_update_request",
    });

    return approvedRequest;
  });
}

export function rejectEmployeeSelfservicePortalProfileUpdateRequest(
  input: RejectEmployeeSelfservicePortalProfileUpdateRequestInput,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalProfileUpdateRequest {
  return runHrSuiteFeatureAction(() => {
    const parsedInput =
      rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema.parse(
        input
      );
    const currentRequest = getEmployeeSelfservicePortalProfileUpdateRequestById(
      parsedInput.requestId
    );

    if (!currentRequest) {
      throw new Error(
        "Employee self-service profile update request not found."
      );
    }

    if (
      !canReviewEmployeeSelfservicePortalProfileUpdateRequest(
        context,
        currentRequest
      )
    ) {
      throw new Error(
        "Employee self-service profile update request rejection denied."
      );
    }

    if (currentRequest.status !== "pending_hr_review") {
      throw new Error(
        "Only pending employee self-service profile update requests can be rejected."
      );
    }

    const rejectedTimestamp = new Date();
    const rejectedRequest: EmployeeSelfservicePortalProfileUpdateRequest = {
      ...currentRequest,
      rejectionReason: parsedInput.rejectionReason,
      reviewedAt: rejectedTimestamp,
      reviewedByUserId: context?.userId ?? null,
      status: "rejected",
      updatedAt: rejectedTimestamp,
    };

    mutateEmployeeSelfservicePortalRepository((snapshot) => ({
      ...snapshot,
      profileUpdateRequests: snapshot.profileUpdateRequests.map((request) =>
        request.id === rejectedRequest.id ? rejectedRequest : request
      ),
    }));

    recordEmployeeSelfservicePortalAuditEvent({
      action:
        employeeSelfservicePortalAuditActions.profileUpdateRequestRejected,
      after: {
        id: rejectedRequest.id,
        rejectionReason: rejectedRequest.rejectionReason,
        reviewedByUserId: rejectedRequest.reviewedByUserId,
        status: rejectedRequest.status,
      },
      before: {
        id: currentRequest.id,
        status: currentRequest.status,
      },
      context,
      employeeId: rejectedRequest.employeeId,
      metadata: {
        requestType: rejectedRequest.requestType,
      },
      reason: rejectedRequest.rejectionReason ?? undefined,
      summary: `Rejected profile update request ${rejectedRequest.id}`,
      targetDisplayName: rejectedRequest.requestType,
      targetId: rejectedRequest.id,
      targetType: "profile_update_request",
    });

    return rejectedRequest;
  });
}
