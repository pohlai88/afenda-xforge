import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveTenantDensityDataAttribute } from "../customise-branding/resolution/resolve-tenant-density";

describe("resolveTenantDensityDataAttribute", () => {
  it("omits data-density for default and undefined tenant density", () => {
    assert.deepEqual(
      resolveTenantDensityDataAttribute({ themePreset: "afenda" }),
      {}
    );
    assert.deepEqual(
      resolveTenantDensityDataAttribute({
        themePreset: "afenda",
        density: "default",
      }),
      {}
    );
  });

  it("maps compact and comfortable tenant density to data-density", () => {
    assert.deepEqual(
      resolveTenantDensityDataAttribute({
        themePreset: "afenda",
        density: "compact",
      }),
      { "data-density": "compact" }
    );
    assert.deepEqual(
      resolveTenantDensityDataAttribute({
        themePreset: "afenda",
        density: "comfortable",
      }),
      { "data-density": "comfortable" }
    );
  });
});
