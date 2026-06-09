import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const RADIUS_SOURCE_TOKENS = defineRegistry(["radius"]);

export const RADIUS_TOKENS = defineRegistry([
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "control",
  "panel",
]);

export type RadiusSourceToken = (typeof RADIUS_SOURCE_TOKENS)[number];
export type RadiusToken = (typeof RADIUS_TOKENS)[number];
export const radiusSourceTokenSchema = z.enum(RADIUS_SOURCE_TOKENS);
export const radiusTokenSchema = z.enum(RADIUS_TOKENS);
