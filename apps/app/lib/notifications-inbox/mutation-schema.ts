import { z } from "zod";

export const notificationInboxPatchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("archive-all"),
  }),
  z.object({
    action: z.literal("mark-all-read"),
  }),
  z.object({
    action: z.literal("mark-read"),
    id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("mark-seen"),
    ids: z.array(z.string().uuid()).min(1),
  }),
]);

export type NotificationInboxPatchInput = z.infer<
  typeof notificationInboxPatchSchema
>;
