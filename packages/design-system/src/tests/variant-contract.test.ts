import assert from "node:assert/strict";
import test from "node:test";
import {
  BADGE_VARIANTS,
  BUTTON_VARIANTS,
  CARD_PADDING,
  CARD_VARIANTS,
  CONTROL_SIZES,
  DENSITY_MODES,
  FIELD_VARIANTS,
  FORM_STATES,
  TABLE_STATES,
  TABLE_VARIANTS,
} from "../contracts";
import { designSystemVariantGroups } from "../variants";

test("variant registries stay aligned with the contract source of truth", () => {
  assert.deepEqual(designSystemVariantGroups.badge.variants, BADGE_VARIANTS);
  assert.deepEqual(designSystemVariantGroups.button.sizes, CONTROL_SIZES);
  assert.deepEqual(designSystemVariantGroups.button.variants, BUTTON_VARIANTS);
  assert.deepEqual(designSystemVariantGroups.card.padding, CARD_PADDING);
  assert.deepEqual(designSystemVariantGroups.card.variants, CARD_VARIANTS);
  assert.deepEqual(designSystemVariantGroups.form.densities, DENSITY_MODES);
  assert.deepEqual(
    designSystemVariantGroups.form.fieldVariants,
    FIELD_VARIANTS
  );
  assert.deepEqual(designSystemVariantGroups.form.states, FORM_STATES);
  assert.deepEqual(designSystemVariantGroups.table.densities, DENSITY_MODES);
  assert.deepEqual(designSystemVariantGroups.table.states, TABLE_STATES);
  assert.deepEqual(designSystemVariantGroups.table.variants, TABLE_VARIANTS);
});
