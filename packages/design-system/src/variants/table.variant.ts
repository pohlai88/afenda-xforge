import type {
  TableState,
  TableVariant,
} from "../contracts/component-variant.contract";
import type { DensityMode } from "../contracts/density.contract";

export {
  DENSITY_MODES as TABLE_DENSITIES,
  TABLE_SIZES,
  TABLE_STATES,
  TABLE_VARIANTS,
  type TableState,
  type TableVariant,
} from "../contracts";

export type TableDensity = DensityMode;
export type TableSize = TableDensity;

export type TableVariantContract = {
  variant: TableVariant;
  density: TableSize;
  state: TableState;
};
