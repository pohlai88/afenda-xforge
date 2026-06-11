import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getDefaultLaneForFeature } from "../contracts/module-lane.catalog";
import { DEFAULT_TENANT_BRANDING_SETTINGS } from "../contracts/tenant-branding.contract";
import { mergeEffectiveBranding } from "../resolution/merge-effective-branding";
import { resolveLaneForFeature } from "../resolution/resolve-tenant-branding";

describe("mergeEffectiveBranding", () => {
  it("layers user theme preset and module overrides on tenant defaults", () => {
    const merged = mergeEffectiveBranding(DEFAULT_TENANT_BRANDING_SETTINGS, {
      themePreset: "teal",
      moduleLaneOverrides: {
        "master-data.customers": "money",
      },
    });

    assert.equal(merged.themePreset, "teal");
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
        themePreset: "xforge",
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
        themePreset: "xforge",
        moduleLaneOverrides: {
          "hr-suite.*": "operations",
        },
      },
      "hr-suite.payroll-compensation"
    );

    assert.equal(lane, "operations");
  });
});
