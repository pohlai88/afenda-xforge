import assert from "node:assert/strict";
import test from "node:test";

test("package exports resolve for root and documented subpaths", async () => {
  const root = await import("@repo/design-system");
  const contracts = await import("@repo/design-system/contracts");
  const tokens = await import("@repo/design-system/tokens");
  const variants = await import("@repo/design-system/variants");

  assert.ok(root.designSystemVariants);
  assert.ok(root.designSystemTokenGroups);
  assert.ok(root.fontPresets);
  assert.ok(root.themePresets);
  assert.ok(contracts.COLOR_MODES);
  assert.ok(contracts.FONT_PRESETS);
  assert.ok(contracts.THEME_PRESETS);
  assert.ok(tokens.designSystemTokenGroups);
  assert.ok(tokens.fontPresets);
  assert.ok(tokens.themePresets);
  assert.ok(variants.designSystemVariantGroups);
});
