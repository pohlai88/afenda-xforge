import assert from "node:assert/strict";
import test from "node:test";

import { AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS } from "../contracts/afenda/customization/branding.contract";
import {
  assertValidTenantBrandingColors,
  BrandingColorValidationFailure,
  validateTenantBrandingColors,
} from "../customise-branding/resolution/validate-branding-colors";

test("default tenant branding passes color validation", () => {
  const result = validateTenantBrandingColors(DEFAULT_TENANT_BRANDING_SETTINGS);
  assert.equal(result.valid, true);
  assertValidTenantBrandingColors(DEFAULT_TENANT_BRANDING_SETTINGS);
});

test("tenant lane override colliding with status hues is rejected", () => {
  const result = validateTenantBrandingColors({
    ...DEFAULT_TENANT_BRANDING_SETTINGS,
    laneColorOverrides: {
      byLane: {
        money: {
          light: {
            solid: "oklch(0.55 0.18 145)",
          },
        },
      },
    },
  });

  assert.equal(result.valid, false);
  assert.match(result.errors[0]?.rule ?? "", /lane-vs-status/);
});

test("assertValidTenantBrandingColors throws structured failures", () => {
  assert.throws(
    () =>
      assertValidTenantBrandingColors({
        ...DEFAULT_TENANT_BRANDING_SETTINGS,
        laneColorOverrides: {
          byLane: {
            money: {
              light: {
                solid: "oklch(0.55 0.18 145)",
              },
            },
          },
        },
      }),
    BrandingColorValidationFailure
  );
});
