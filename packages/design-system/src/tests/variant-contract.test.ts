import assert from "node:assert/strict";
import test from "node:test";

import {
  AFENDA_BADGE_VARIANTS,
  AFENDA_BUTTON_VARIANTS,
  AFENDA_CARD_PADDING,
  AFENDA_CARD_VARIANTS,
  AFENDA_CONTROL_SIZES,
  AFENDA_DENSITY_MODES,
  AFENDA_FIELD_VARIANTS,
  AFENDA_FORM_VARIANT_STATES,
  AFENDA_TABLE_STATES,
  AFENDA_TABLE_VARIANTS,
  afendaComponentSizeRegistry,
  afendaComponentVariantRegistry,
  validateAfendaComponentSizeRegistry,
  validateAfendaComponentVariantRegistry,
} from "../contracts/afenda";

test("component variant registry validates and exposes governed vocabulary", () => {
  validateAfendaComponentVariantRegistry();
  validateAfendaComponentSizeRegistry();

  assert.deepEqual(afendaComponentVariantRegistry.badgeVariants, AFENDA_BADGE_VARIANTS);
  assert.deepEqual(afendaComponentVariantRegistry.buttonVariants, AFENDA_BUTTON_VARIANTS);
  assert.deepEqual(afendaComponentVariantRegistry.cardVariants, AFENDA_CARD_VARIANTS);
  assert.deepEqual(afendaComponentVariantRegistry.cardPadding, AFENDA_CARD_PADDING);
  assert.deepEqual(afendaComponentVariantRegistry.fieldVariants, AFENDA_FIELD_VARIANTS);
  assert.deepEqual(
    afendaComponentVariantRegistry.formStates,
    AFENDA_FORM_VARIANT_STATES
  );
  assert.deepEqual(afendaComponentVariantRegistry.tableVariants, AFENDA_TABLE_VARIANTS);
  assert.deepEqual(afendaComponentVariantRegistry.tableStates, AFENDA_TABLE_STATES);
  assert.deepEqual(afendaComponentSizeRegistry.controlSizes, AFENDA_CONTROL_SIZES);
  assert.deepEqual(AFENDA_DENSITY_MODES, ["compact", "default", "comfortable"]);
});
