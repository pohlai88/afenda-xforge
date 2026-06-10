import "server-only";

import type { LamMutationContext } from "../execution.ts";

export {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  denyLamMutation,
  normalizeLamMutationActorId,
  recordLamMutationAuditEvent,
  requireLamMutationAccess,
} from "../execution.ts";

export type LamExecutionContext = LamMutationContext;
