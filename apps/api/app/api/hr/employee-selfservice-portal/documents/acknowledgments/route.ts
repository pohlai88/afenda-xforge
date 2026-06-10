import { acknowledgeDocumentsManagementPolicyInputSchema } from "@repo/features-employee-management-documents-management/contracts";
import {
  acknowledgeDocumentsManagementPolicy,
  listDocumentsManagementPolicyAcknowledgmentSummaries,
} from "@repo/features-employee-management-documents-management/server";
import { recordEmployeeSelfservicePortalAuditEvent } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import {
  createEmployeeSelfservicePortalReadContext,
  createEmployeeSelfservicePortalWriteContext,
} from "../../_lib/context.ts";

const buildDocumentsReadContext = (
  request: Request
): Parameters<
  typeof listDocumentsManagementPolicyAcknowledgmentSummaries
>[1] => {
  const essContext = createEmployeeSelfservicePortalReadContext(request);

  return {
    actorEmployeeId: essContext.actorEmployeeId,
    actorId: essContext.actorId,
    canDownload: false,
    canRead: essContext.canRead,
    canSelfAcknowledge: true,
    canViewSensitive: false,
    companyId: essContext.companyId,
    organizationId: essContext.organizationId,
    requestId: essContext.requestId,
    tenantId: essContext.tenantId,
    userId: essContext.userId,
  };
};

export function GET(request: Request): Response {
  const essContext = createEmployeeSelfservicePortalReadContext(request);

  if (!(essContext.canRead && essContext.actorEmployeeId)) {
    return NextResponse.json([], { status: 200 });
  }

  const summaries = listDocumentsManagementPolicyAcknowledgmentSummaries(
    { employeeId: essContext.actorEmployeeId },
    buildDocumentsReadContext(request)
  );

  recordEmployeeSelfservicePortalAuditEvent({
    action: "hr.employee-selfservice-portal.documents.acknowledgments.view",
    after: {
      count: summaries.length,
    },
    context: essContext,
    employeeId: essContext.actorEmployeeId,
    metadata: {
      count: summaries.length,
    },
    summary: `Viewed ${summaries.length} policy acknowledgment items`,
    targetId: essContext.actorEmployeeId,
    targetType: "employee_document_acknowledgments",
  });

  return NextResponse.json(summaries);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const essContext = createEmployeeSelfservicePortalWriteContext(request);
    const acknowledged = await acknowledgeDocumentsManagementPolicy(
      acknowledgeDocumentsManagementPolicyInputSchema.parse(
        await request.json()
      ),
      {
        actorEmployeeId: essContext.actorEmployeeId,
        actorId: essContext.actorId,
        canDownload: false,
        canRead: essContext.canRead,
        canSelfAcknowledge: true,
        canViewSensitive: false,
        canWrite: essContext.canWrite,
        companyId: essContext.companyId,
        organizationId: essContext.organizationId,
        requestId: essContext.requestId,
        tenantId: essContext.tenantId,
        userId: essContext.userId,
      }
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action:
        "hr.employee-selfservice-portal.documents.acknowledgments.acknowledge",
      after: {
        acknowledgmentId: acknowledged.acknowledgmentId,
        obligationId: acknowledged.id,
        status: acknowledged.status,
      },
      context: essContext,
      employeeId: acknowledged.employeeId,
      metadata: {
        acknowledgmentId: acknowledged.acknowledgmentId,
        obligationId: acknowledged.id,
        policyId: acknowledged.policyId,
        policyVersion: acknowledged.policyVersion,
        status: acknowledged.status,
      },
      summary: `Acknowledged ${acknowledged.title}`,
      targetId: acknowledged.id,
      targetType: "employee_document_acknowledgment",
    });

    return NextResponse.json(acknowledged);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid acknowledgment payload",
      },
      { status: 400 }
    );
  }
}
