import { z } from "zod";
import { operationalModuleIds } from "./ai-operations.schema.ts";

const moduleIds: typeof operationalModuleIds = operationalModuleIds;

export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(40),
  contextModuleId: z.enum(moduleIds).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
