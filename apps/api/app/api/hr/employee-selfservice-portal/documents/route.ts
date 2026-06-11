import { listDocumentsManagementDocumentSummaries } from "@repo/features-employee-management-documents-management/server";
import { recordEmployeeSelfservicePortalAuditEvent } from "@repo/features-employee-management-employee-selfservice-portal/server";
import { NextResponse } from "next/server";

import { getDocumentsManagementQuery } from "../../documents/_lib/context.ts";
import { createEmployeeSelfservicePortalReadContext } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const essContext = await createEmployeeSelfservicePortalReadContext(request);

    if (!(essContext.canRead && essContext.actorEmployeeId)) {
      return NextResponse.json([], { status: 200 });
    }

    const query = getDocumentsManagementQuery(request);
    const summaries = listDocumentsManagementDocumentSummaries(
      {
        ...query,
        employeeId: essContext.actorEmployeeId,
      },
      {
        actorEmployeeId: essContext.actorEmployeeId,
        actorId: essContext.actorId,
        canDownload: false,
        canRead: true,
        canSelfAcknowledge: true,
        canViewSensitive: false,
        companyId: essContext.companyId,
        organizationId: essContext.organizationId,
        requestId: essContext.requestId,
        tenantId: essContext.tenantId,
        userId: essContext.userId,
      }
    );

    recordEmployeeSelfservicePortalAuditEvent({
      action: "hr.employee-selfservice-portal.documents.view",
      after: {
        count: summaries.length,
      },
      context: essContext,
      employeeId: essContext.actorEmployeeId,
      metadata: {
        count: summaries.length,
      },
      summary: `Viewed ${summaries.length} self-service document summaries`,
      targetId: essContext.actorEmployeeId,
      targetType: "employee_documents",
    });

    return NextResponse.json(summaries);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}
