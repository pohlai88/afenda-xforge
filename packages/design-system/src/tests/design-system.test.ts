import assert from "node:assert/strict";
import test from "node:test";

import { designSystemVariantGroups, designSystemVariants } from "..";

test("design system variants expose the supported values", () => {
  assert.deepEqual(designSystemVariants.button.variants, [
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
  assert.deepEqual(designSystemVariants.button.sizes, [
    "sm",
    "md",
    "lg",
    "icon",
  ]);
  assert.deepEqual(designSystemVariants.badge.variants, [
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
  assert.deepEqual(designSystemVariants.card.variants, [
    "default",
    "surface",
    "muted",
    "accent",
    "danger",
  ]);
  assert.deepEqual(designSystemVariants.card.padding, [
    "none",
    "sm",
    "md",
    "lg",
  ]);
  assert.deepEqual(designSystemVariants.table.variants, [
    "default",
    "bordered",
    "surface",
    "dense",
  ]);
  assert.deepEqual(designSystemVariants.table.densities, [
    "compact",
    "default",
    "comfortable",
  ]);
  assert.deepEqual(designSystemVariants.table.states, [
    "loading",
    "empty",
    "error",
    "forbidden",
    "ready",
  ]);
  assert.deepEqual(designSystemVariants.form.densities, [
    "compact",
    "default",
    "comfortable",
  ]);
  assert.deepEqual(designSystemVariants.form.states, [
    "idle",
    "pending",
    "invalid",
    "success",
    "error",
    "forbidden",
  ]);
  assert.deepEqual(designSystemVariants.form.fieldVariants, [
    "default",
    "invalid",
    "readonly",
    "disabled",
  ]);
  assert.deepEqual(
    designSystemVariantGroups.button.variants,
    designSystemVariants.button.variants
  );
  assert.deepEqual(
    designSystemVariantGroups.badge.variants,
    designSystemVariants.badge.variants
  );
});
