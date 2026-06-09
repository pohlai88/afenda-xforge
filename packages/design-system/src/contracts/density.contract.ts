import { z } from "zod";

import { defineRegistry } from "./registry.schema";

export const DENSITY_MODES = defineRegistry([
  "compact",
  "default",
  "comfortable",
]);

export type DensityMode = (typeof DENSITY_MODES)[number];
export const densityModeSchema = z.enum(DENSITY_MODES);

export const DENSITY_TOKEN_NAMES = defineRegistry([
  "density-control-height",
  "density-table-row-height",
]);

export type DensityTokenName = (typeof DENSITY_TOKEN_NAMES)[number];
export const densityTokenNameSchema = z.enum(DENSITY_TOKEN_NAMES);

export type DensityTokenContract = {
  mode: DensityMode;
  controlHeightToken: "density-control-height";
  tableRowHeightToken: "density-table-row-height";
};

export const densityTokenContractSchema = z
  .object({
    mode: densityModeSchema,
    controlHeightToken: z.literal("density-control-height"),
    tableRowHeightToken: z.literal("density-table-row-height"),
  })
  .strict();
