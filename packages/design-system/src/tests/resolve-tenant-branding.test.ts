import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultLaneForFeature } from "../contracts/module-lane.catalog";
import {
  DEFAULT_TENANT_BRANDING_SETTINGS,
  tenantBrandingSettingsSchema,
  type TenantBrandingSettings,
} from "../contracts/tenant-branding.contract";
import {
  resolveActiveLaneCssVars,
  resolveLaneForFeature,
  resolveLaneScale,
  resolveTenantBrandCssVars,
  renderTenantBrandingStyleBlock,
} from "../resolution/resolve-tenant-branding";

const customMoneySolid = "oklch(0.55 0.18 145)";

test("resolveLaneForFeature prefers module overrides over catalog defaults", () => {
  const settings: TenantBrandingSettings = {
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    moduleLaneOverrides: {
      "master-data.customers": "money",
    },
  };

  assert.equal(resolveLaneForFeature(settings, "master-data.customers"), "money");
  assert.equal(
    getDefaultLaneForFeature("master-data.customers"),
    "customer",
    "catalog default unchanged"
  );
});

test("resolveLaneScale merges byLane then byFeature overrides", () => {
  const settings = tenantBrandingSettingsSchema.parse({
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    laneColorOverrides: {
      byLane: {
        money: {
          light: {
            solid: customMoneySolid,
            foreground: "oklch(0.14 0.02 145)",
            muted: "color-mix(in oklab, oklch(0.55 0.18 145) 12%, transparent)",
            "muted-foreground": "oklch(0.42 0.06 145)",
            border: "color-mix(in oklab, oklch(0.55 0.18 145) 35%, transparent)",
            glow: "color-mix(in oklab, oklch(0.55 0.18 145) 24%, transparent)",
          },
          dark: {
            solid: customMoneySolid,
            foreground: "oklch(0.98 0.01 145)",
            muted: "color-mix(in oklab, oklch(0.55 0.18 145) 18%, transparent)",
            "muted-foreground": "oklch(0.72 0.04 145)",
            border: "color-mix(in oklab, oklch(0.55 0.18 145) 40%, transparent)",
            glow: "color-mix(in oklab, oklch(0.55 0.18 145) 30%, transparent)",
          },
        },
      },
      byFeature: {
        "master-data.currencies": {
          light: {
            solid: "oklch(0.62 0.2 145)",
            foreground: "oklch(0.14 0.02 145)",
            muted: "color-mix(in oklab, oklch(0.62 0.2 145) 12%, transparent)",
            "muted-foreground": "oklch(0.42 0.06 145)",
            border: "color-mix(in oklab, oklch(0.62 0.2 145) 35%, transparent)",
            glow: "color-mix(in oklab, oklch(0.62 0.2 145) 24%, transparent)",
          },
          dark: {
            solid: "oklch(0.62 0.2 145)",
            foreground: "oklch(0.98 0.01 145)",
            muted: "color-mix(in oklab, oklch(0.62 0.2 145) 18%, transparent)",
            "muted-foreground": "oklch(0.72 0.04 145)",
            border: "color-mix(in oklab, oklch(0.62 0.2 145) 40%, transparent)",
            glow: "color-mix(in oklab, oklch(0.62 0.2 145) 30%, transparent)",
          },
        },
      },
    },
  });

  const laneOnly = resolveLaneScale(settings, "money", undefined, "light");
  assert.equal(laneOnly.solid, customMoneySolid);

  const featureOverride = resolveLaneScale(
    settings,
    "money",
    "master-data.currencies",
    "light"
  );
  assert.equal(featureOverride.solid, "oklch(0.62 0.2 145)");
});

test("resolveActiveLaneCssVars maps scale fields to --lane-active-* vars", () => {
  const vars = resolveActiveLaneCssVars(
    DEFAULT_TENANT_BRANDING_SETTINGS,
    "master-data.customers",
    "light"
  );

  assert.equal(vars["--lane-active-id"], "customer");
  assert.ok(vars["--lane-active"]);
  assert.ok(vars["--lane-active-foreground"]);
  assert.ok(vars["--lane-active-muted"]);
});

test("resolveTenantBrandCssVars follows selected theme preset", () => {
  const tealSettings: TenantBrandingSettings = {
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    themePreset: "teal",
  };

  const vars = resolveTenantBrandCssVars(tealSettings, "light");
  assert.ok(vars["--tenant-primary"]);
  assert.notEqual(
    vars["--tenant-primary"],
    resolveTenantBrandCssVars(DEFAULT_TENANT_BRANDING_SETTINGS, "light")[
      "--tenant-primary"
    ]
  );
});

test("renderTenantBrandingStyleBlock emits :root and .dark blocks", () => {
  const css = renderTenantBrandingStyleBlock(DEFAULT_TENANT_BRANDING_SETTINGS);

  assert.match(css, /^:root \{/);
  assert.match(css, /\.dark \{/);
  assert.match(css, /--tenant-primary:/);
});
