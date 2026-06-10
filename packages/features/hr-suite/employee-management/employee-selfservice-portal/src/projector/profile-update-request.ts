import type {
  EmployeeSelfservicePortalProfileUpdateRequest,
  EmployeeSelfservicePortalProfileUpdateRequestView,
} from "../schema.ts";
import { employeeSelfservicePortalProfileUpdateRequestViewSchema } from "../schema.ts";

export function projectEmployeeSelfservicePortalProfileUpdateRequest(
  request: EmployeeSelfservicePortalProfileUpdateRequest
): EmployeeSelfservicePortalProfileUpdateRequestView {
  return employeeSelfservicePortalProfileUpdateRequestViewSchema.parse({
    ...request,
    createdAt: request.createdAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    submittedAt: request.submittedAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  });
}
