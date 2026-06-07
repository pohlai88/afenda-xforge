import type { OpenApiDocument } from "@repo/openapi";
import { registerAuditOpenApi as registerAuditContractOpenApi } from "./contract.ts";

export const registerAuditOpenApi = (document: OpenApiDocument): void => {
  registerAuditContractOpenApi(document);
};
