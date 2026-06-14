import assert from "node:assert/strict";
import test from "node:test";

test("package exports resolve for root and documented subpaths", async () => {
  const root = await import("@repo/design-system");
  const contracts = await import("@repo/design-system/contracts");
  const customiseBranding = await import(
    "@repo/design-system/customise-branding"
  );
  const css = await import("@repo/design-system/css");
  const cssAdapters = await import("@repo/design-system/css/adapters");
  const tokens = await import("@repo/design-system/css/tokens");

  assert.equal("designSystemVariants" in root, false);
  assert.equal("designSystemVariantGroups" in root, false);
  assert.equal("designSystemTokenGroups" in root, false);
  assert.equal("fontPresets" in root, false);
  assert.equal("themePresets" in root, false);
  assert.equal("afendaDesignTokenCatalogExport" in root, false);
  assert.equal("afendaTokenUiCatalog" in root, false);
  assert.equal("afendaTokenCatalog" in root, false);
  assert.equal("validateAfendaTokenCatalog" in root, false);
  assert.ok(root.resolveAfendaRuntimeTokenSnapshot);
  assert.ok(root.resolvePresentationMetadata);
  assert.equal("badgeVariants" in root, false);
  assert.equal("buttonSizes" in root, false);
  assert.equal("buttonVariants" in root, false);
  assert.equal("cardPadding" in root, false);
  assert.equal("cardVariants" in root, false);
  assert.equal("fieldVariants" in root, false);
  assert.equal("formDensities" in root, false);
  assert.equal("formStates" in root, false);
  assert.equal("tableDensities" in root, false);
  assert.equal("tableStates" in root, false);
  assert.equal("tableVariants" in root, false);
  assert.ok(root.getTenantBranding);
  assert.ok(root.getUserBrandingPreferences);
  assert.ok(root.resolveTenantDensityDataAttribute);
  assert.ok(customiseBranding.mergeEffectiveBranding);
  assert.ok(customiseBranding.getTenantBranding);
  assert.ok(customiseBranding.getUserBrandingPreferences);
  assert.ok(customiseBranding.resolveTenantDensityDataAttribute);
  assert.equal("designSystemTokenGroups" in css, false);
  assert.equal("designSystemVariantGroups" in css, false);
  assert.ok(css.renderGlobalsCss);
  assert.ok(cssAdapters.renderGlobalsCss);
  assert.ok(cssAdapters.compareGlobalsCss);
  assert.ok(contracts.AFENDA_COLOR_MODES);
  assert.ok(contracts.AFENDA_FONT_PRESETS);
  assert.ok(contracts.AFENDA_THEME_PRESET_REGISTRY);
  assert.equal("designSystemTokenGroups" in tokens, false);
  assert.equal("animationTokens" in tokens, false);
  assert.equal("baseColorTokens" in tokens, false);
  assert.equal("chartColorTokens" in tokens, false);
  assert.equal("densityTokens" in tokens, false);
  assert.equal("fontPresets" in tokens, false);
  assert.equal("motionPreferences" in tokens, false);
  assert.equal("radiusTokens" in tokens, false);
  assert.equal("shadowTokens" in tokens, false);
  assert.equal("themePresets" in tokens, false);
  assert.ok(tokens.afendaDesignTokenCatalogExport);
  assert.ok(tokens.afendaTokenUiCatalog);
  assert.ok(tokens.afendaTokenCatalog);
  assert.ok(tokens.validateAfendaTokenCatalog);
  assert.ok(tokens.resolveAfendaRuntimeTokens);
  assert.equal("badgeVariants" in css, false);
  assert.equal("designSystemVariantGroups" in css, false);

  const afenda = await import("@repo/design-system/contracts/afenda");
  assert.ok(afenda.afendaDesignSystemManifest);
  assert.ok(afenda.afendaRuntimeReferenceContract);
  assert.ok(afenda.afendaHueReservationContract);
  assert.equal(afenda.AFENDA_COLOR_HUE_SYSTEM.status.destructive, 27);
  assert.ok(afenda.afendaChartUsageContract);
  assert.equal(afenda.AFENDA_COLOR_USAGE_RATIO.neutral, 90);
  assert.equal(
    afenda.afendaDesignSystemContract.defaults.themePreset,
    "vercel-geist"
  );
  assert.ok(afenda.AFENDA_TOKENIZED_TOKEN_TYPES.includes("color"));
  assert.equal(afenda.AFENDA_TOKEN_UI_DISPLAY_COMPONENTS.color, "ColorToken");
  assert.ok(afenda.afendaRuntimeTokenResolutionContract);
  assert.ok(afenda.AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES.includes("literal"));
  assert.ok(afenda.AFENDA_TOKEN_UI_COMPONENT_NAV.length >= 10);
  assert.equal("AFENDA_ACCESSIBILITY_RULES" in afenda, false);
  assert.equal("AFENDA_VISUAL_DESIGN_RULES" in afenda, false);
  assert.equal("afendaAdapterContract" in afenda, false);
  assert.equal("afendaLegacyDeprecationManifest" in afenda, false);

  const afendaCatalogs = await import(
    "@repo/design-system/contracts/afenda/catalogs"
  );
  const afendaCustomization = await import(
    "@repo/design-system/contracts/afenda/customization"
  );
  const afendaForms = await import(
    "@repo/design-system/contracts/afenda/forms"
  );
  const afendaGates = await import(
    "@repo/design-system/contracts/afenda/gates"
  );
  const afendaRegistries = await import(
    "@repo/design-system/contracts/afenda/registries"
  );
  const afendaReferences = await import(
    "@repo/design-system/contracts/afenda/references"
  );
  const afendaRules = await import(
    "@repo/design-system/contracts/afenda/rules"
  );
  const afendaRuntime = await import(
    "@repo/design-system/contracts/afenda/runtime"
  );
  const blockedAdaptersSubpath: string =
    "@repo/design-system/contracts/afenda/adapters";
  const blockedLegacySubpath: string =
    "@repo/design-system/contracts/afenda/legacy";

  await assert.rejects(
    () => import(blockedAdaptersSubpath),
    "legacy adapters must stay internal-only"
  );
  await assert.rejects(
    () => import(blockedLegacySubpath),
    "legacy deprecation manifest must stay internal-only"
  );
  assert.ok(afendaCatalogs.afendaModuleLaneCatalog);
  assert.ok(afendaCatalogs.AFENDA_GOV_DESIGN_SYSTEM);
  assert.equal(
    afendaCatalogs.getAfendaDefaultLaneForFeature(
      "hr-suite.payroll-compensation.periods"
    ),
    "money"
  );
  assert.ok(afendaCustomization.afendaTenantBrandingContract);
  assert.equal(
    afendaCustomization.afendaTenantBrandingContract.defaults.themePreset,
    "afenda"
  );
  assert.ok(afendaCustomization.afendaUserBrandingContract);
  assert.deepEqual(
    afendaCustomization.afendaUserBrandingContract.emptyPreferences,
    {}
  );
  assert.ok(afendaForms.afendaFormFrameworkContract);
  assert.ok(afendaForms.afendaFormFieldContract);
  assert.ok(afendaGates.afendaQualityGateContract);
  assert.ok(afendaRegistries.afendaChartRegistry);
  assert.ok(afendaRegistries.AFENDA_CHART_COLOR_TOKENS.includes("chart-1"));
  assert.deepEqual(afendaRegistries.AFENDA_THEME_PRESET_NAMES, [
    "afenda",
    "vercel-geist",
  ]);
  assert.ok(afendaRegistries.afendaColorTokenRegistry);
  assert.ok(afendaRegistries.AFENDA_BASE_COLOR_TOKENS.includes("background"));
  assert.ok(afendaRegistries.afendaComponentSizeRegistry);
  assert.ok(afendaRegistries.AFENDA_CONTROL_SIZES.includes("icon"));
  assert.ok(afendaRegistries.afendaComponentVariantRegistry);
  assert.ok(afendaRegistries.AFENDA_BUTTON_VARIANTS.includes("destructive"));
  assert.ok(afendaRegistries.afendaDensityRegistry);
  assert.ok(
    afendaRegistries.AFENDA_DENSITY_TOKEN_NAMES.includes(
      "density-control-height"
    )
  );
  assert.ok(afendaRegistries.afendaFontRegistry);
  assert.ok(afendaRegistries.AFENDA_FONT_PRESET_NAMES.includes("geist"));
  assert.ok(afendaRegistries.afendaMotionRegistry);
  assert.ok(
    afendaRegistries.AFENDA_MOTION_ANIMATION_TOKENS.includes("shimmer")
  );
  assert.ok(afendaRegistries.afendaOrderRegistry);
  assert.ok(afendaRegistries.AFENDA_ORDER_TOKENS.includes("overlay"));
  assert.ok(afendaRegistries.afendaRadiusRegistry);
  assert.ok(afendaRegistries.AFENDA_RADIUS_TOKENS.includes("control"));
  assert.ok(afendaRegistries.afendaShadowRegistry);
  assert.ok(
    afendaRegistries.AFENDA_SHADOW_ALIAS_TOKENS.includes("lane-active-glow")
  );
  assert.ok(afendaRegistries.afendaStatusToneRegistry);
  assert.ok(afendaRegistries.AFENDA_STATUS_TONES.includes("destructive"));
  assert.ok(afendaRegistries.afendaTypographyTokenRegistry);
  assert.ok(afendaRegistries.AFENDA_FONT_FEATURE_TOKENS.includes("rlig"));
  assert.ok(afendaRegistries.AFENDA_TYPE_SCALE_ROLES.includes("read"));
  assert.ok(afendaRegistries.afendaVisualLaneRegistry);
  assert.ok(afendaRegistries.AFENDA_ERP_VISUAL_LANE_IDS.includes("governance"));
  assert.equal(afendaReferences.VERCEL_GEIST_THEME_PRESET_NAME, "vercel-geist");
  assert.equal(afendaReferences.getVercelGeistColor("ink").hex, "#171717");
  assert.ok(afendaRules.AFENDA_RULE_REGISTRY.length > 0);
  assert.ok(afendaRules.AFENDA_ACCESSIBILITY_RULES.length > 0);
  assert.ok(afendaRules.AFENDA_VISUAL_DESIGN_RULES.length > 0);
  assert.ok(afendaRuntime.afendaRuleEvaluationContract);
  assert.ok(afendaRuntime.afendaViolationContract);
  assert.ok(afendaRuntime.afendaAgentGovernanceContract);

  const presentation = await import("@repo/design-system/presentation");
  assert.ok(presentation.resolvePresentationMetadata);
  assert.ok(afenda.afendaPresentationMetadataContract);
  assert.ok(afenda.afendaPresentationResolutionContract);
  assert.ok(afendaCatalogs.afendaPresentationResolutionCatalog);
  assert.ok(afendaRegistries.afendaPrimitiveColorRegistry);
  assert.ok(afendaRegistries.afendaComponentTokenRegistry);
  assert.ok(afenda.AFENDA_ALLOWED_VISUAL_TOKENS.includes("bg-primary"));
});
