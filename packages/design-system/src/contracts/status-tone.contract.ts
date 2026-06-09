import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const STATUS_TONES = defineRegistry([
  "neutral",
  "success",
  "warning",
  "destructive",
  "info",
]);

export type StatusTone = (typeof STATUS_TONES)[number];
export const statusToneSchema = z.enum(STATUS_TONES);

export const STATUS_INTENTS = defineRegistry([
  "default",
  "muted",
  "solid",
  "outline",
]);

export type StatusIntent = (typeof STATUS_INTENTS)[number];
export const statusIntentSchema = z.enum(STATUS_INTENTS);

export type StatusToneContract = {
  tone: StatusTone;
  intent: StatusIntent;
  label: string;
};

export const statusToneContractSchema = z
  .object({
    tone: statusToneSchema,
    intent: statusIntentSchema,
    label: z.string().trim().min(1),
  })
  .strict();
