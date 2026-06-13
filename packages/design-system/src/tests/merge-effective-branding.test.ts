import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAfendaDefaultLaneForFeature as getDefaultLaneForFeature } from "../contracts/afenda/catalogs/module-lane.catalog";
import { AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS } from "../contracts/afenda/customization/branding.contract";
import { mergeEffectiveBranding } from "../customise-branding/resolution/merge-effective-branding";
import { resolveLaneForFeature } from "../customise-branding/resolution/resolve-tenant-branding";

describe("mergeEffectiveBranding", () => {
  it("layers user theme preset and module overrides on tenant defaults", () => {
    const merged = mergeEffectiveBranding(DEFAULT_TENANT_BRANDING_SETTINGS, {
      themePreset: "vercel-geist",
      moduleLaneOverrides: {
        "master-data.customers": "money",
      },
    });

    assert.equal(merged.themePreset, "vercel-geist");
    assert.equal(
      resolveLaneForFeature(merged, "master-data.customers"),
      "money"
    );
    assert.equal(
      resolveLaneForFeature(merged, "system-admin.audit"),
      getDefaultLaneForFeature("system-admin.audit")
    );
  });

  it("merges lane color overrides with user taking precedence", () => {
    const merged = mergeEffectiveBranding(
      {
        themePreset: "afenda",
        laneColorOverrides: {
          byLane: {
            money: {
              light: { solid: "oklch(0.5 0.1 155)" },
            },
          },
        },
      },
      {
        laneColorOverrides: {
          byLane: {
            money: {
              dark: { solid: "oklch(0.7 0.12 155)" },
            },
          },
          byFeature: {
            "master-data.customers": {
              light: { solid: "oklch(0.62 0.11 265)" },
            },
          },
        },
      }
    );

    assert.equal(
      merged.laneColorOverrides?.byLane?.money?.light?.solid,
      "oklch(0.5 0.1 155)"
    );
    assert.equal(
      merged.laneColorOverrides?.byLane?.money?.dark?.solid,
      "oklch(0.7 0.12 155)"
    );
    assert.equal(
      merged.laneColorOverrides?.byFeature?.["master-data.customers"]?.light
        ?.solid,
      "oklch(0.62 0.11 265)"
    );
  });
});

describe("resolveLaneForFeature prefix overrides", () => {
  it("honors moduleLaneOverrides keys ending with *", () => {
    const lane = resolveLaneForFeature(
      {
        themePreset: "afenda",
        moduleLaneOverrides: {
          "hr-suite.*": "operations",
        },
      },
      "hr-suite.payroll-compensation"
    );

    assert.equal(lane, "operations");
  });

  it("passes tenant density through without user overlay changes", () => {
    const merged = mergeEffectiveBranding(
      {
        themePreset: "afenda",
        density: "compact",
      },
      {
        themePreset: "vercel-geist",
      }
    );

    assert.equal(merged.themePreset, "vercel-geist");
    assert.equal(merged.density, "compact");
  });
});
