import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const COLOR_MODES = defineRegistry(["light", "dark"]);

export type ColorMode = (typeof COLOR_MODES)[number];
export const colorModeSchema = z.enum(COLOR_MODES);

export const BASE_COLOR_TOKENS = defineRegistry([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "surface",
  "surface-foreground",
  "surface-muted",
  "surface-accent",
  "muted",
  "muted-foreground",
  "border",
  "input",
  "ring",
]);

export const SURFACE_COLOR_TOKENS = defineRegistry([
  "surface",
  "surface-foreground",
  "surface-muted",
  "surface-accent",
]);

export const BRAND_COLOR_TOKENS = defineRegistry([
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
]);

export const SEMANTIC_COLOR_TOKENS = defineRegistry([
  ...BASE_COLOR_TOKENS,
  ...BRAND_COLOR_TOKENS,
]);

export type BaseColorToken = (typeof BASE_COLOR_TOKENS)[number];
export type BrandColorToken = (typeof BRAND_COLOR_TOKENS)[number];
export type SurfaceColorToken = (typeof SURFACE_COLOR_TOKENS)[number];
export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKENS)[number];
export const baseColorTokenSchema = z.enum(BASE_COLOR_TOKENS);
export const brandColorTokenSchema = z.enum(BRAND_COLOR_TOKENS);
export const surfaceColorTokenSchema = z.enum(SURFACE_COLOR_TOKENS);
export const semanticColorTokenSchema = z.enum(SEMANTIC_COLOR_TOKENS);

export const STATUS_COLOR_TOKENS = defineRegistry([
  "success",
  "success-foreground",
  "success-muted",
  "success-muted-foreground",
  "success-border",
  "warning",
  "warning-foreground",
  "warning-muted",
  "warning-muted-foreground",
  "warning-border",
  "destructive",
  "destructive-foreground",
  "destructive-muted",
  "destructive-muted-foreground",
  "destructive-border",
  "invert",
  "invert-foreground",
  "info",
  "info-foreground",
  "info-muted",
  "info-muted-foreground",
  "info-border",
]);

export const SIDEBAR_COLOR_TOKENS = defineRegistry([
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

export type StatusColorToken = (typeof STATUS_COLOR_TOKENS)[number];
export type SidebarColorToken = (typeof SIDEBAR_COLOR_TOKENS)[number];
export const statusColorTokenSchema = z.enum(STATUS_COLOR_TOKENS);
export const sidebarColorTokenSchema = z.enum(SIDEBAR_COLOR_TOKENS);

export type ColorToken =
  | BaseColorToken
  | BrandColorToken
  | SurfaceColorToken
  | StatusColorToken
  | SidebarColorToken;
