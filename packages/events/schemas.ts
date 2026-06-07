import { z } from "zod";
import type { EventSchema } from "./versioning.ts";
import { getSchemaRegistry } from "./versioning.ts";

export const eventTypes = {
  cacheInvalidateRequested: "xforge.cache.invalidate.requested",
  executionCommitted: "xforge.execution.committed",
  linearCustomerSyncRequested: "xforge.linear.customer.sync.requested",
  searchReindexRequested: "xforge.search.reindex.requested",
  workdayCompanySyncRequested: "xforge.workday.company.sync.requested",
} as const;

export const ExecutionCommittedPayloadSchema = z.object({
  action: z.string().min(1),
  auditEventId: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),
  entity: z.string().min(1),
  entityId: z.string().min(1),
  feature: z.string().min(1),
  grantId: z.string().min(1).optional(),
});

export const CacheInvalidateRequestedPayloadSchema = z.object({
  companyId: z.string().min(1).optional(),
  feature: z.string().min(1).optional(),
  keys: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1).optional(),
  scope: z.enum(["company", "global", "tenant"]).default("tenant"),
});

export const SearchReindexRequestedPayloadSchema = z.object({
  entity: z.string().min(1),
  entityIds: z.array(z.string().min(1)).min(1),
  feature: z.string().min(1),
  reason: z.string().min(1).optional(),
});

export const LinearCustomerSyncRequestedPayloadSchema = z.object({
  action: z.string().min(1),
  actorId: z.string().min(1),
  entity: z.literal("customer"),
  entityId: z.string().min(1),
  feature: z.literal("customers"),
  reason: z.string().min(1).optional(),
  tenantId: z.string().min(1),
});

export const WorkdayCompanySyncRequestedPayloadSchema = z.object({
  action: z.string().min(1),
  actorId: z.string().min(1),
  companyId: z.string().min(1).optional(),
  entity: z.literal("company"),
  entityId: z.string().min(1),
  feature: z.literal("companies"),
  grantId: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  tenantId: z.string().min(1),
});

export type ExecutionCommittedPayload = z.infer<
  typeof ExecutionCommittedPayloadSchema
>;
export type CacheInvalidateRequestedPayload = z.infer<
  typeof CacheInvalidateRequestedPayloadSchema
>;
export type SearchReindexRequestedPayload = z.infer<
  typeof SearchReindexRequestedPayloadSchema
>;
export type LinearCustomerSyncRequestedPayload = z.infer<
  typeof LinearCustomerSyncRequestedPayloadSchema
>;
export type WorkdayCompanySyncRequestedPayload = z.infer<
  typeof WorkdayCompanySyncRequestedPayloadSchema
>;

export const xforgeEventSchemas: EventSchema[] = [
  {
    description:
      "Published after a successful audited mutation completes and post-commit hooks may run.",
    schema: ExecutionCommittedPayloadSchema,
    type: eventTypes.executionCommitted,
    version: 1,
  },
  {
    description:
      "Requests cache invalidation for tenant- or company-scoped read models after a successful mutation.",
    schema: CacheInvalidateRequestedPayloadSchema,
    type: eventTypes.cacheInvalidateRequested,
    version: 1,
  },
  {
    description:
      "Requests read-model or search index refresh after a successful mutation.",
    schema: SearchReindexRequestedPayloadSchema,
    type: eventTypes.searchReindexRequested,
    version: 1,
  },
  {
    description:
      "Requests the first Linear sync after a successful customer mutation.",
    schema: LinearCustomerSyncRequestedPayloadSchema,
    type: eventTypes.linearCustomerSyncRequested,
    version: 1,
  },
  {
    description:
      "Requests Workday company sync after a successful company mutation.",
    schema: WorkdayCompanySyncRequestedPayloadSchema,
    type: eventTypes.workdayCompanySyncRequested,
    version: 1,
  },
];

export const registerXForgeEventSchemas = (): void => {
  const registry = getSchemaRegistry();

  for (const schema of xforgeEventSchemas) {
    registry.register(schema);
  }
};
