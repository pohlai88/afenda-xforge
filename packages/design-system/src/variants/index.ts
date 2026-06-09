import { BADGE_VARIANTS as badgeVariantsValue } from "./badge.variant";
import {
  BUTTON_SIZES as buttonSizesValue,
  BUTTON_VARIANTS as buttonVariantsValue,
} from "./button.variant";
import {
  CARD_PADDING as cardPaddingValue,
  CARD_VARIANTS as cardVariantsValue,
} from "./card.variant";
import {
  FIELD_VARIANTS as fieldVariantsValue,
  FORM_DENSITIES as formDensitiesValue,
  FORM_STATES as formStatesValue,
} from "./form.variant";
import {
  TABLE_DENSITIES as tableDensitiesValue,
  TABLE_STATES as tableStatesValue,
  TABLE_VARIANTS as tableVariantsValue,
} from "./table.variant";

export const badgeVariants: typeof badgeVariantsValue = badgeVariantsValue;
export const buttonSizes: typeof buttonSizesValue = buttonSizesValue;
export const buttonVariants: typeof buttonVariantsValue = buttonVariantsValue;
export const cardPadding: typeof cardPaddingValue = cardPaddingValue;
export const cardVariants: typeof cardVariantsValue = cardVariantsValue;
export const fieldVariants: typeof fieldVariantsValue = fieldVariantsValue;
export const formDensities: typeof formDensitiesValue = formDensitiesValue;
export const formStates: typeof formStatesValue = formStatesValue;
export const tableDensities: typeof tableDensitiesValue = tableDensitiesValue;
export const tableStates: typeof tableStatesValue = tableStatesValue;
export const tableVariants: typeof tableVariantsValue = tableVariantsValue;

export const designSystemVariantGroups = {
  badge: {
    variants: badgeVariantsValue,
  },
  button: {
    sizes: buttonSizesValue,
    variants: buttonVariantsValue,
  },
  card: {
    padding: cardPaddingValue,
    variants: cardVariantsValue,
  },
  form: {
    densities: formDensitiesValue,
    fieldVariants: fieldVariantsValue,
    states: formStatesValue,
  },
  table: {
    densities: tableDensitiesValue,
    states: tableStatesValue,
    variants: tableVariantsValue,
  },
} as const;

export type DesignSystemVariantGroups = typeof designSystemVariantGroups;
