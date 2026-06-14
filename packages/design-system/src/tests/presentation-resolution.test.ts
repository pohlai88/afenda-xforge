import assert from "node:assert/strict";
import test from "node:test";

import {
  AFENDA_LANE_ACCENT_TAILWIND_CLASSES,
  validateAfendaPresentationResolutionCatalog,
} from "../contracts/afenda/catalogs/presentation-resolution.catalog";
import {
  assertPresentationSafeInput,
  validateAfendaPresentationMetadataContract,
} from "../contracts/afenda/presentation-metadata.contract";
import { validateAfendaPresentationResolutionContract } from "../contracts/afenda/presentation-resolution.contract";
import {
  validateAfendaComponentTokenRegistry,
} from "../contracts/afenda/registries/component-token.registry";
import {
  validateAfendaPrimitiveColorRegistry,
} from "../contracts/afenda/registries/primitive-color.registry";
import {
  AFENDA_ALLOWED_VISUAL_TOKENS,
  isAfendaAllowedVisualToken,
} from "../contracts/afenda/visual-token.contract";
import { resolvePresentationMetadata } from "../runtime/resolve-presentation-metadata";

test("presentation contracts and catalogs validate", () => {
  validateAfendaPresentationMetadataContract();
  validateAfendaPresentationResolutionContract();
  validateAfendaPresentationResolutionCatalog();
  validateAfendaComponentTokenRegistry();
  validateAfendaPrimitiveColorRegistry();
});

test("presentation metadata rejects forbidden authority keys", () => {
  assert.throws(
    () =>
      assertPresentationSafeInput({
        density: "compact",
        permissionFinality: true,
      }),
    /forbidden authority key: permissionFinality/
  );
});

test("resolvePresentationMetadata maps density to data-density attribute", () => {
  const compact = resolvePresentationMetadata({ density: "compact" });
  assert.equal(compact.dataAttributes["data-density"], "compact");

  const defaultMode = resolvePresentationMetadata({ density: "default" });
  assert.equal(defaultMode.dataAttributes["data-density"], undefined);
});

test("resolvePresentationMetadata maps button variant to semantic tailwind classes", () => {
  const bundle = resolvePresentationMetadata({
    componentFamily: "button",
    variantFamily: "button",
    variant: "destructive",
  });

  assert.ok(bundle.tailwindClasses.includes("bg-destructive"));
  assert.ok(bundle.tailwindClasses.includes("text-destructive-foreground"));
  assert.ok(bundle.cssVariables["--density-control-height"]);
});

test("resolvePresentationMetadata maps tone and lane accents", () => {
  const tone = resolvePresentationMetadata({ tone: "success" });
  assert.ok(tone.tailwindClasses.includes("text-success"));

  const lane = resolvePresentationMetadata({ lane: "money" });
  assert.equal(lane.cssVariables["--lane-active-id"], "money");
  for (const token of AFENDA_LANE_ACCENT_TAILWIND_CLASSES) {
    assert.ok(lane.tailwindClasses.includes(token));
  }
});

test("resolvePresentationMetadata deduplicates tailwind classes", () => {
  const bundle = resolvePresentationMetadata({
    componentFamily: "badge",
    variantFamily: "badge",
    variant: "lane",
    lane: "customer",
    tone: "neutral",
  });

  const unique = new Set(bundle.tailwindClasses);
  assert.equal(unique.size, bundle.tailwindClasses.length);
});

test("resolvePresentationMetadata matrix: density x variant x tone x lane", () => {
  const densities = ["compact", "default", "comfortable"] as const;
  const variants = ["default", "outline", "destructive"] as const;
  const tones = ["neutral", "success", "warning"] as const;
  const lanes = ["money", "people", "goods"] as const;

  for (const density of densities) {
    for (const variant of variants) {
      for (const tone of tones) {
        for (const lane of lanes) {
          const bundle = resolvePresentationMetadata({
            componentFamily: "button",
            variantFamily: "button",
            variant,
            density,
            tone,
            lane,
            size: "md",
          });

          assert.ok(bundle.tailwindClasses.length > 0);
          assert.ok(bundle.governanceReferences.length > 0);
          assert.equal(
            bundle.dataAttributes["data-density"],
            density === "default" ? undefined : density
          );
        }
      }
    }
  }
});

test("visual token allowlist matches lane accent tailwind output", () => {
  for (const token of AFENDA_LANE_ACCENT_TAILWIND_CLASSES) {
    assert.ok(isAfendaAllowedVisualToken(token));
  }

  assert.equal(isAfendaAllowedVisualToken("bg-gray-100"), false);
  assert.ok(AFENDA_ALLOWED_VISUAL_TOKENS.includes("bg-primary"));
});

test("token catalog DTCG export includes presentationRoles on color tokens", async () => {
  const { afendaDesignTokenCatalogExport } = await import("../css/tokens/token-catalog");

  const background = afendaDesignTokenCatalogExport["color-background"];
  assert.ok(background);
  assert.deepEqual(background.$extensions.afenda.presentationRoles, ["surface"]);

  const primary = afendaDesignTokenCatalogExport["color-brand-primary"];
  assert.ok(primary);
  assert.deepEqual(primary.$extensions.afenda.presentationRoles, [
    "brand",
    "accent",
  ]);
});
