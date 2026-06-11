import { archiveDocumentsManagementDocumentsForSeparatedEmployee } from "@repo/features-employee-management-documents-management/server";
import {
  offboardingCaseProjectionSchema,
  updateOffboardingCaseInputSchema,
} from "@repo/features-employee-management-offboarding-exit-management";
import {
  getOffboardingCaseById,
  updateOffboardingCase,
} from "@repo/features-employee-management-offboarding-exit-management/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createOffboardingReadContext,
  createOffboardingWriteContext,
} from "../../_lib/context.ts";
import {
  ensureOffboardingReadAccess,
  ensureOffboardingWriteAccess,
  mutationStatusFromResult,
  parseOffboardingRequestBody,
  parseOffboardingRouteParams,
  respondWithOffboardingError,
  validateOffboardingResponse,
} from "../../_lib/http.ts";

const caseRouteParamsSchema = z.object({
  caseId: z.string().trim().min(1, "caseId is required"),
});

const updateCaseBodySchema = updateOffboardingCaseInputSchema.omit({
  caseId: true,
});

export async function GET(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const readContext = await createOffboardingReadContext(request);
    const denied = ensureOffboardingReadAccess(readContext);
    if (denied) {
      return denied;
    }

    const { caseId } = parseOffboardingRouteParams(
      await context.params,
      caseRouteParamsSchema
    );
    const data = await getOffboardingCaseById(caseId, readContext);

    if (!data) {
      return NextResponse.json(
        {
          code: "not_found",
          error: "Offboarding case not found",
          ok: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      validateOffboardingResponse(data, offboardingCaseProjectionSchema)
    );
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const writeContext = await createOffboardingWriteContext(request);
    const denied = ensureOffboardingWriteAccess(writeContext);
    if (denied) {
      return denied;
    }

    const { caseId } = parseOffboardingRouteParams(
      await context.params,
      caseRouteParamsSchema
    );
    const body = await parseOffboardingRequestBody(
      request,
      updateCaseBodySchema
    );
    const result = await updateOffboardingCase(
      {
        caseId,
        ...body,
      },
      writeContext
    );

    if (result.ok && body.status === "completed") {
      const offboardingCase = await getOffboardingCaseById(
        caseId,
        writeContext
      );

      if (offboardingCase) {
        await archiveDocumentsManagementDocumentsForSeparatedEmployee(
          {
            employeeId: offboardingCase.employeeId,
          },
          {
            actorId: writeContext.actorId,
            canAdminRetention: true,
            canRead: true,
            canReadAudit: true,
            canViewSensitive: writeContext.canViewSensitive,
            canWrite: true,
            companyId: writeContext.companyId,
            requestId: writeContext.requestId,
            tenantId: writeContext.tenantId,
          }
        );
      }
    }

    return NextResponse.json(result, {
      status: mutationStatusFromResult(result),
    });
  } catch (error) {
    return respondWithOffboardingError(error);
  }
}
