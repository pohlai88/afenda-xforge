import type {
  FieldVariant,
  FormState,
} from "../contracts/component-variant.contract";
import type { DensityMode } from "../contracts/density.contract";

export {
  DENSITY_MODES as FORM_DENSITIES,
  DENSITY_MODES as FORM_DENSITY_MODES,
  FIELD_VARIANTS,
  FIELD_VARIANTS as FORM_FIELD_VARIANTS,
  type FieldVariant,
  FORM_STATES,
  type FormState,
} from "../contracts";

export type FormDensity = DensityMode;
export type FormDensityMode = FormDensity;
export type FormFieldVariant = FieldVariant;

export type FormVariantContract = {
  density: FormDensityMode;
  state: FormState;
};

export type FieldVariantContract = {
  variant: FieldVariant;
};
