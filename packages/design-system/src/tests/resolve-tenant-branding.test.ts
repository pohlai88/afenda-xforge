import assert from "node:assert/strict";
import test from "node:test";

import { getAfendaDefaultLaneForFeature as getDefaultLaneForFeature } from "../contracts/afenda/catalogs/module-lane.catalog";
import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "../contracts/afenda/customization/branding.contract";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS,
  afendaTenantBrandingSettingsSchema as tenantBrandingSettingsSchema,
} from "../contracts/afenda/customization/branding.contract";
import {
  renderTenantBrandingStyleBlock,
  resolveActiveLaneCssVars,
  resolveLaneForFeature,
  resolveLaneScale,
  resolveTenantBrandCssVars,
} from "../customise-branding/resolution/resolve-tenant-branding";
import {
  applyTenantBrandingPatch,
  resolveTenantBrandingFeatureSnapshot,
  resolveTenantBrandingModeCssVars,
  resolveTenantBrandingSnapshot,
  summarizeTenantBranding,
} from "../customise-branding/resolution/tenant-branding-purpose";

const customMoneySolid = "oklch(0.55 0.18 145)";

test("resolveLaneForFeature prefers module overrides over catalog defaults", () => {
  const settings: TenantBrandingSettings = {
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    moduleLaneOverrides: {
      "master-data.customers": "money",
    },
  };

  assert.equal(
    resolveLaneForFeature(settings, "master-data.customers"),
    "money"
  );
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
            border:
              "color-mix(in oklab, oklch(0.55 0.18 145) 35%, transparent)",
            glow: "color-mix(in oklab, oklch(0.55 0.18 145) 24%, transparent)",
          },
          dark: {
            solid: customMoneySolid,
            foreground: "oklch(0.98 0.01 145)",
            muted: "color-mix(in oklab, oklch(0.55 0.18 145) 18%, transparent)",
            "muted-foreground": "oklch(0.72 0.04 145)",
            border:
              "color-mix(in oklab, oklch(0.55 0.18 145) 40%, transparent)",
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
  const geistSettings: TenantBrandingSettings = {
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    themePreset: "vercel-geist",
  };

  const vars = resolveTenantBrandCssVars(geistSettings, "light");
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

test("applyTenantBrandingPatch deep merges tenant branding safely", () => {
  const settings = applyTenantBrandingPatch(DEFAULT_TENANT_BRANDING_SETTINGS, {
    moduleLaneOverrides: {
      "hr-suite.*": "people",
    },
    laneColorOverrides: {
      byLane: {
        money: {
          light: {
            solid: "oklch(0.62 0.11 250)",
          },
        },
      },
    },
  });

  const next = applyTenantBrandingPatch(settings, {
    laneColorOverrides: {
      byLane: {
        money: {
          dark: {
            solid: "oklch(0.72 0.12 250)",
          },
        },
      },
    },
  });

  assert.equal(next.moduleLaneOverrides?.["hr-suite.*"], "people");
  assert.equal(
    next.laneColorOverrides?.byLane?.money?.light?.solid,
    "oklch(0.62 0.11 250)"
  );
  assert.equal(
    next.laneColorOverrides?.byLane?.money?.dark?.solid,
    "oklch(0.72 0.12 250)"
  );
});

test("applyTenantBrandingPatch sets and clears tenant density", () => {
  const withDensity = applyTenantBrandingPatch(DEFAULT_TENANT_BRANDING_SETTINGS, {
    density: "compact",
  });

  assert.equal(withDensity.density, "compact");

  const cleared = applyTenantBrandingPatch(withDensity, {
    density: undefined,
  });

  assert.equal(cleared.density, undefined);
});

test("summarizeTenantBranding reports tenant customization scope", () => {
  const summary = summarizeTenantBranding({
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    density: "comfortable",
    moduleLaneOverrides: {
      "hr-suite.*": "people",
    },
    laneColorOverrides: {
      byLane: {
        money: {
          light: {
            solid: "oklch(0.62 0.11 265)",
          },
        },
      },
      byFeature: {
        "master-data.customers": {
          light: {
            solid: "oklch(0.64 0.12 265)",
          },
        },
      },
    },
  });

  assert.equal(summary.themePreset, "afenda");
  assert.equal(summary.density, "comfortable");
  assert.equal(summary.moduleLaneOverrideCount, 1);
  assert.equal(summary.laneColorOverrideCount, 1);
  assert.equal(summary.featureColorOverrideCount, 1);
  assert.deepEqual(summary.affectedLaneIds, ["money", "people"]);
});

test("resolveTenantBrandingSnapshot produces css and feature payloads", () => {
  const snapshot = resolveTenantBrandingSnapshot(
    DEFAULT_TENANT_BRANDING_SETTINGS,
    ["master-data.customers"]
  );

  assert.equal(snapshot.validation.valid, true);
  assert.equal(snapshot.summary.themePreset, "afenda");
  assert.ok(snapshot.css.light["--tenant-primary"]);
  assert.ok(snapshot.css.dark["--tenant-primary"]);
  assert.match(snapshot.css.styleBlock, /:root/);
  assert.equal(snapshot.features[0]?.featureId, "master-data.customers");
  assert.equal(snapshot.features[0]?.laneId, "customer");
  assert.ok(snapshot.features[0]?.cssVars.light["--lane-active"]);
});

test("resolveTenantBrandingModeCssVars returns mode-specific tenant vars", () => {
  const vars = resolveTenantBrandingModeCssVars(
    DEFAULT_TENANT_BRANDING_SETTINGS,
    "light"
  );

  assert.ok(vars["--tenant-primary"]);
  assert.ok(vars["--tenant-accent"]);
});

test("resolveTenantBrandingFeatureSnapshot includes light and dark lane scales", () => {
  const snapshot = resolveTenantBrandingFeatureSnapshot(
    DEFAULT_TENANT_BRANDING_SETTINGS,
    "system-admin.audit"
  );

  assert.equal(snapshot.featureId, "system-admin.audit");
  assert.ok(snapshot.scale.light.solid);
  assert.ok(snapshot.scale.dark.solid);
});
