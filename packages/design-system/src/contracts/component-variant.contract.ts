import { z } from "zod";

import type { ControlSize } from "./component-size.contract";
import { controlSizeSchema } from "./component-size.contract";
import { defineRegistry } from "./registry.schema";
import type { StatusTone } from "./status-tone.contract";
import { statusToneSchema } from "./status-tone.contract";

export const BUTTON_VARIANTS = defineRegistry([
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
  "success",
  "warning",
  "info",
]);

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export const buttonVariantSchema = z.enum(BUTTON_VARIANTS);

export const BADGE_VARIANTS = defineRegistry([
  "default",
  "secondary",
  "outline",
  "muted",
  "lane",
  "success",
  "warning",
  "destructive",
  "info",
]);

export type BadgeVariant = (typeof BADGE_VARIANTS)[number];
export const badgeVariantSchema = z.enum(BADGE_VARIANTS);

export const CARD_VARIANTS = defineRegistry([
  "default",
  "surface",
  "muted",
  "accent",
  "danger",
]);

export type CardVariant = (typeof CARD_VARIANTS)[number];
export const cardVariantSchema = z.enum(CARD_VARIANTS);

export const CARD_PADDING = defineRegistry(["none", "sm", "md", "lg"]);

export type CardPadding = (typeof CARD_PADDING)[number];
export type CardPaddingOption = CardPadding;
export const cardPaddingSchema = z.enum(CARD_PADDING);

export const FORM_STATES = defineRegistry([
  "idle",
  "pending",
  "invalid",
  "success",
  "error",
  "forbidden",
]);

export type FormState = (typeof FORM_STATES)[number];
export const formStateSchema = z.enum(FORM_STATES);

export const TABLE_STATES = defineRegistry([
  "loading",
  "empty",
  "error",
  "forbidden",
  "ready",
]);

export type TableState = (typeof TABLE_STATES)[number];
export const tableStateSchema = z.enum(TABLE_STATES);

export const TABLE_VARIANTS = defineRegistry([
  "default",
  "bordered",
  "surface",
  "dense",
]);

export type TableVariant = (typeof TABLE_VARIANTS)[number];
export const tableVariantSchema = z.enum(TABLE_VARIANTS);

export const FIELD_VARIANTS = defineRegistry([
  "default",
  "invalid",
  "readonly",
  "disabled",
]);

export type FieldVariant = (typeof FIELD_VARIANTS)[number];
export const fieldVariantSchema = z.enum(FIELD_VARIANTS);

export type ButtonVariantContract = {
  variant: ButtonVariant;
  size: ControlSize;
};

export type BadgeVariantContract = {
  variant: BadgeVariant;
  tone?: StatusTone;
};

export type CardVariantContract = {
  variant: CardVariant;
};

export const buttonVariantContractSchema = z
  .object({
    variant: buttonVariantSchema,
    size: controlSizeSchema,
  })
  .strict();

export const badgeVariantContractSchema = z
  .object({
    variant: badgeVariantSchema,
    tone: statusToneSchema.optional(),
  })
  .strict();

export const cardVariantContractSchema = z
  .object({
    variant: cardVariantSchema,
  })
  .strict();
