/**
 * Server-only public door for the canonical mutation pipeline.
 */
import "server-only";

export type {
  ExecutionActor,
  ExecutionCompany,
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
  ExecutionMutationContext,
  ExecutionPipelineHooks,
  ExecutionPostCommitHook,
  ExecutionTenant,
} from "./pipeline.ts";
export { createExecutionPipeline } from "./pipeline.ts";
