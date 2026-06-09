import { z } from "zod";

import { DENSITY_MODES } from "./density.contract";
import { defineRegistry } from "./registry.schema";

export const COMPONENT_SIZES = defineRegistry(["xs", "sm", "md", "lg", "xl"]);

export type ComponentSize = (typeof COMPONENT_SIZES)[number];
export const componentSizeSchema = z.enum(COMPONENT_SIZES);

export const CONTROL_SIZES = defineRegistry(["sm", "md", "lg", "icon"]);

export type ControlSize = (typeof CONTROL_SIZES)[number];
export const controlSizeSchema = z.enum(CONTROL_SIZES);

export const TABLE_SIZES: typeof DENSITY_MODES = DENSITY_MODES;

export type TableSize = (typeof TABLE_SIZES)[number];
export const tableSizeSchema = z.enum(TABLE_SIZES);
