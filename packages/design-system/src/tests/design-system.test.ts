import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  resolveAfendaRuntimeToken,
  resolveAfendaRuntimeTokenSnapshot,
} from "..";
import {
  AFENDA_BADGE_VARIANTS,
  AFENDA_BUTTON_VARIANTS,
  AFENDA_CARD_PADDING,
  AFENDA_CARD_VARIANTS,
  AFENDA_CONTROL_SIZES,
  AFENDA_DENSITY_MODES,
  AFENDA_FIELD_VARIANTS,
  AFENDA_FORM_VARIANT_STATES,
  AFENDA_TABLE_STATES,
  AFENDA_TABLE_VARIANTS,
} from "../contracts/afenda";

const TESTS_ROOT = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(TESTS_ROOT, "..", "..", "..", "..");

function readDesignSystemSource(relativePath: string): string {
  return readFileSync(resolve(TESTS_ROOT, "..", relativePath), "utf8");
}

function readWorkspaceSource(relativePath: string): string {
  return readFileSync(resolve(WORKSPACE_ROOT, relativePath), "utf8");
}

function extractOrderTokenClasses(source: string): readonly string[] {
  return [
    ...new Set(
      [...source.matchAll(/\bz-layer-(?:background|base|ornament|raised|sticky|popover|overlay)\b/g)].map(
        (match) => match[0]
      )
    ),
  ].sort();
}

const ROOT_FORBIDDEN_TOKEN_EXPORTS = [
  "afendaDesignTokenCatalogExport",
  "afendaTokenCatalog",
  "afendaTokenUiCatalog",
  "validateAfendaTokenCatalog",
  "fontPresetNames",
  "fontPresets",
  "fontRoles",
  "themeBrandColorTokens",
  "themePresetNames",
  "themePresets",
] as const;

const TOKENS_FORBIDDEN_LOW_LEVEL_EXPORTS = [
  "animationTokens",
  "baseColorTokens",
  "brandColorTokens",
  "chartColorTokens",
  "densityModes",
  "densityTokens",
  "fontFeatureTokens",
  "fontFamilyTokens",
  "fontPresetNames",
  "fontPresets",
  "fontRoles",
  "motionPreferences",
  "radiusSourceTokens",
  "radiusTokens",
  "shadowTokens",
  "sidebarColorTokens",
  "statusColorTokens",
  "surfaceColorTokens",
  "textUtilityTokens",
  "themeBrandColorTokens",
  "themePresetNames",
  "themePresets",
  "typeScaleRoles",
  "typeUtilityTokens",
] as const;

const ROOT_FORBIDDEN_VARIANT_EXPORTS = [
  "badgeVariants",
  "buttonSizes",
  "buttonVariants",
  "cardPadding",
  "cardVariants",
  "fieldVariants",
  "formDensities",
  "formStates",
  "tableDensities",
  "tableStates",
  "tableVariants",
] as const;

const REGISTRY_BACKED_TOKEN_SOURCE_SPECS = [
  {
    relativePath: "css/tokens/color-tokens.ts",
    exportName: "COLOR_TOKEN_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/registry-token-specs.ts",
    exportName: "DENSITY_TOKEN_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/registry-token-specs.ts",
    exportName: "MOTION_TOKEN_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/registry-token-specs.ts",
    exportName: "ORDER_TOKEN_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/registry-token-specs.ts",
    exportName: "RADIUS_TOKEN_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/registry-token-specs.ts",
    exportName: "SHADOW_TOKEN_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/typography-tokens.ts",
    exportName: "TYPE_SCALE_DEFINITIONS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
  {
    relativePath: "css/tokens/typography-tokens.ts",
    exportName: "TYPOGRAPHY_SCALE_SPECS",
    dependencyPattern: /contracts\/afenda\/registries\//,
  },
] as const;

test("design system variants expose the supported values", () => {
  assert.deepEqual(AFENDA_BUTTON_VARIANTS, [
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
  assert.deepEqual(AFENDA_CONTROL_SIZES, [
    "sm",
    "md",
    "lg",
    "icon",
  ]);
  assert.deepEqual(AFENDA_BADGE_VARIANTS, [
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
  assert.deepEqual(AFENDA_CARD_VARIANTS, [
    "default",
    "surface",
    "muted",
    "accent",
    "danger",
  ]);
  assert.deepEqual(AFENDA_CARD_PADDING, [
    "none",
    "sm",
    "md",
    "lg",
  ]);
  assert.deepEqual(AFENDA_TABLE_VARIANTS, [
    "default",
    "bordered",
    "surface",
    "dense",
  ]);
  assert.deepEqual(AFENDA_DENSITY_MODES, [
    "compact",
    "default",
    "comfortable",
  ]);
  assert.deepEqual(AFENDA_TABLE_STATES, [
    "loading",
    "empty",
    "error",
    "forbidden",
    "ready",
  ]);
  assert.deepEqual(AFENDA_FORM_VARIANT_STATES, [
    "idle",
    "pending",
    "invalid",
    "success",
    "error",
    "forbidden",
  ]);
  assert.deepEqual(AFENDA_FIELD_VARIANTS, [
    "default",
    "invalid",
    "readonly",
    "disabled",
  ]);
});

test("token vocabulary authority stays in afenda registries", () => {
  const registryBackedSources = [
    "css/tokens/color-tokens.ts",
    "css/tokens/registry-token-specs.ts",
    "css/tokens/typography-tokens.ts",
  ];

  for (const relativePath of registryBackedSources) {
    const source = readDesignSystemSource(relativePath);

    assert.match(
      source,
      /contracts\/afenda\/registries\//,
      `${relativePath} must source vocabulary from afenda registries`
    );
    assert.doesNotMatch(
      source,
      /defineRegistry\(/,
      `${relativePath} must not define local vocabulary registries`
    );
  }

  const densityTokenSource = readDesignSystemSource(
    "css/tokens/registry-token-specs.ts"
  );

  assert.doesNotMatch(
    densityTokenSource,
    /contracts\/afenda\/design-system\.contract/,
    "density token vocabulary must not come from design-system.contract"
  );
});

test("token catalog is the only DTCG export authority", () => {
  const tokenCatalogSource = readDesignSystemSource("css/tokens/token-catalog.ts");
  const tokenIndexSource = readDesignSystemSource("css/tokens/index.ts");
  const rootIndexSource = readDesignSystemSource("index.ts");

  assert.match(
    tokenCatalogSource,
    /afendaDesignTokenCatalogExport = Object\.fromEntries\(\s*afendaTokenCatalog\.map/s,
    "afendaDesignTokenCatalogExport must be derived directly from afendaTokenCatalog"
  );
  assert.doesNotMatch(
    tokenCatalogSource,
    /afendaDesignTokenCatalogExport = Object\.fromEntries\(\s*afendaTokenUiCatalog\.map/s,
    "afendaDesignTokenCatalogExport must not be derived from afendaTokenUiCatalog"
  );
  assert.doesNotMatch(
    tokenIndexSource,
    /\$extensions|\$type|\$value/,
    "css token index must not define parallel DTCG export entries"
  );
  assert.doesNotMatch(
    rootIndexSource,
    /\$extensions|\$type|\$value/,
    "package root index must not define parallel DTCG export entries"
  );
});

test("token catalog stays builder-assembled instead of hand-authoring entries", () => {
  const tokenCatalogSource = readDesignSystemSource("css/tokens/token-catalog.ts");

  assert.match(
    tokenCatalogSource,
    /const colorCatalog = \[\s*\.\.\.COLOR_TOKEN_SPECS\.base,\s*\.\.\.COLOR_TOKEN_SPECS\.brand,\s*\.\.\.COLOR_TOKEN_SPECS\.status,\s*\.\.\.COLOR_TOKEN_SPECS\.sidebar,\s*\.\.\.COLOR_TOKEN_SPECS\.chart,\s*\]\.map\(\(spec\) => buildColorCatalogToken\(spec\)\);/s,
    "color catalog must be assembled from COLOR_TOKEN_SPECS"
  );
  assert.match(
    tokenCatalogSource,
    /const typographyCatalog = TYPOGRAPHY_SCALE_SPECS\.map\(\(spec\) =>\s*buildTypographyCatalogToken\(spec\)\s*\);/s,
    "typography catalog must be assembled from TYPOGRAPHY_SCALE_SPECS"
  );
  assert.match(
    tokenCatalogSource,
    /const spacingCatalog = DENSITY_TOKEN_SPECS\.tokens\.map\(\(spec\) =>\s*buildSpacingCatalogToken\(spec\)\s*\);/s,
    "spacing catalog must be assembled from DENSITY_TOKEN_SPECS.tokens"
  );
  assert.match(
    tokenCatalogSource,
    /const radiusCatalog = RADIUS_TOKEN_SPECS\.tokens\.map\(\(spec\) =>\s*buildRadiusCatalogToken\(spec\)\s*\);/s,
    "radius catalog must be assembled from RADIUS_TOKEN_SPECS.tokens"
  );
  assert.match(
    tokenCatalogSource,
    /const elevationCatalog = SHADOW_TOKEN_SPECS\.elevations\.map\(\(spec\) =>\s*buildElevationCatalogToken\(spec\)\s*\);/s,
    "elevation catalog must be assembled from SHADOW_TOKEN_SPECS.elevations"
  );
  assert.match(
    tokenCatalogSource,
    /const durationCatalog = MOTION_TOKEN_SPECS\.animations\.map\(\(spec\) =>\s*buildDurationCatalogToken\(spec\)\s*\);/s,
    "duration catalog must be assembled from MOTION_TOKEN_SPECS.animations"
  );
  assert.match(
    tokenCatalogSource,
    /const orderCatalog = ORDER_TOKEN_SPECS\.tokens\.map\(\(spec\) =>\s*buildOrderCatalogToken\(spec\)\s*\);/s,
    "order catalog must be assembled from ORDER_TOKEN_SPECS.tokens"
  );
  assert.match(
    tokenCatalogSource,
    /const fontFamilyCatalog = TYPOGRAPHY_FONT_FAMILY_SPECS\.map\(\(spec\) =>\s*buildFontFamilyCatalogToken\(spec\)\s*\)\.filter\(\(token\): token is AfendaTokenizedToken => token !== null\);/s,
    "font family catalog must be assembled from TYPOGRAPHY_FONT_FAMILY_SPECS"
  );
  assert.match(
    tokenCatalogSource,
    /const fontWeightCatalog = TYPOGRAPHY_FONT_WEIGHT_SPECS\.map\(\(spec\) =>\s*buildFontWeightCatalogToken\(spec\)\s*\);/s,
    "font weight catalog must be assembled from TYPOGRAPHY_FONT_WEIGHT_SPECS"
  );
  assert.match(
    tokenCatalogSource,
    /const numberCatalog = TYPOGRAPHY_NUMBER_SPECS\.map\(\(spec\) =>\s*buildNumberCatalogToken\(spec\)\s*\);/s,
    "number catalog must be assembled from TYPOGRAPHY_NUMBER_SPECS"
  );
  assert.doesNotMatch(
    tokenCatalogSource,
    /export const afendaTokenCatalog = \[(?:(?!\];).)*\{\s*name:/s,
    "afendaTokenCatalog must not contain hand-authored inline token entries"
  );
  assert.doesNotMatch(
    tokenCatalogSource,
    /export const afendaTokenUiCatalog = \[(?:(?!\];).)*displayComponent:/s,
    "afendaTokenUiCatalog must be derived from afendaTokenCatalog, not hand-authored inline entries"
  );
});

test("token catalog entries stay derived from registry-backed token sources", () => {
  const tokenCatalogSource = readDesignSystemSource("css/tokens/token-catalog.ts");

  for (const sourceSpec of REGISTRY_BACKED_TOKEN_SOURCE_SPECS) {
    const source = readDesignSystemSource(sourceSpec.relativePath);

    assert.match(
      source,
      sourceSpec.dependencyPattern,
      `${sourceSpec.relativePath} must stay backed by afenda registries`
    );
    assert.match(
      source,
      new RegExp(`export const ${sourceSpec.exportName}\\b`),
      `${sourceSpec.relativePath} must expose ${sourceSpec.exportName}`
    );
  }

  assert.match(
    tokenCatalogSource,
    /from "\.\/color-tokens";/,
    "token catalog must derive color entries from color token specs"
  );
  assert.match(
    tokenCatalogSource,
    /from "\.\/registry-token-specs";/,
    "token catalog must derive registry-backed entries from registry token specs"
  );
  assert.match(
    tokenCatalogSource,
    /from "\.\/typography-tokens";/,
    "token catalog must derive typography entries from typography token specs"
  );
  assert.doesNotMatch(
    tokenCatalogSource,
    /contracts\/afenda\/registries\//,
    "token catalog must not bypass token source specs by importing registries directly"
  );
  assert.doesNotMatch(
    tokenCatalogSource,
    /buildColorCatalogToken\(\{\s*token:|buildSpacingCatalogToken\(\{\s*token:|buildRadiusCatalogToken\(\{\s*token:|buildElevationCatalogToken\(\{\s*token:|buildDurationCatalogToken\(\{\s*token:|buildOrderCatalogToken\(\{\s*token:/s,
    "token catalog must not hand-author builder inputs for token entries"
  );
});

test("runtime token snapshot stays downstream from catalog and branding state", () => {
  const runtimeTokenSnapshotSource = readDesignSystemSource(
    "css/tokens/runtime-token-snapshot.ts"
  );

  assert.match(
    runtimeTokenSnapshotSource,
    /afendaTokenCatalog/,
    "runtime token snapshot must resolve from afendaTokenCatalog"
  );
  assert.match(
    runtimeTokenSnapshotSource,
    /resolveTenantBrandingModeCssVars/,
    "runtime token snapshot must resolve active values from branding state"
  );
  assert.doesNotMatch(
    runtimeTokenSnapshotSource,
    /afendaTokenUiCatalog/,
    "runtime token snapshot must not resolve from afendaTokenUiCatalog"
  );
  assert.doesNotMatch(
    runtimeTokenSnapshotSource,
    /contracts\/afenda\/registries\//,
    "runtime token snapshot must not define or import token vocabulary registries"
  );
  assert.doesNotMatch(
    runtimeTokenSnapshotSource,
    /defineRegistry\(|AFENDA_[A-Z0-9_]+_TOKENS\s*=\s*\[/,
    "runtime token snapshot must not define local token vocabulary"
  );
});

test("representative UI surfaces keep explicit order token semantics", () => {
  const representativeMappings = [
    {
      label: "orbit layout",
      relativePath: "apps/storybook/stories/metadata-orbit-layout.tsx",
      expectedTokens: [
        "z-layer-base",
        "z-layer-ornament",
        "z-layer-raised",
        "z-layer-sticky",
      ],
    },
    {
      label: "unauthenticated marketing shell",
      relativePath: "apps/app/app/[locale]/(unauthenticated)/layout.tsx",
      expectedTokens: ["z-layer-base"],
    },
    {
      label: "tree item baseline and focus",
      relativePath: "packages/ui/src/components/compose/tree/tree.shared.tsx",
      expectedTokens: ["z-layer-base", "z-layer-popover", "z-layer-sticky"],
    },
    {
      label: "avatar badge ornament",
      relativePath: "packages/ui/src/components/ui-shadcn/avatar.tsx",
      expectedTokens: ["z-layer-ornament"],
    },
    {
      label: "local active input emphasis",
      relativePath: "packages/ui/src/components/ui-shadcn/input-otp.tsx",
      expectedTokens: ["z-layer-raised"],
    },
    {
      label: "sticky workspace chrome",
      relativePath: "packages/ui/src/components/compose/workspace/1.0-workspace-app-nav-topbar.tsx",
      expectedTokens: ["z-layer-sticky"],
    },
    {
      label: "anchored popover surface",
      relativePath: "packages/ui/src/components/ui-shadcn/popover.tsx",
      expectedTokens: ["z-layer-popover"],
    },
    {
      label: "modal overlay surface",
      relativePath: "packages/ui/src/components/ui-shadcn/dialog.tsx",
      expectedTokens: ["z-layer-overlay"],
    },
  ] as const;

  const actualMappings = Object.fromEntries(
    representativeMappings.map(({ label, relativePath }) => [
      label,
      extractOrderTokenClasses(readWorkspaceSource(relativePath)),
    ])
  );

  const expectedMappings = Object.fromEntries(
    representativeMappings.map(({ label, expectedTokens }) => [
      label,
      [...expectedTokens].sort(),
    ])
  );

  assert.deepEqual(
    actualMappings,
    expectedMappings,
    "representative UI files should keep their intended z-layer-* semantics explicit"
  );
});

test("legacy token aliases stay removed after migration", async () => {
  const root = await import("@repo/design-system");
  const tokens = await import("@repo/design-system/css/tokens");
  const tokenCatalogSource = readDesignSystemSource("css/tokens/token-catalog.ts");
  const tokenIndexSource = readDesignSystemSource("css/tokens/index.ts");
  const rootIndexSource = readDesignSystemSource("index.ts");

  assert.equal("afendaDesignTokenExport" in root, false);
  assert.equal("afendaTokenUiDisplayTokens" in root, false);
  assert.equal("afendaTokenizedTokens" in root, false);
  assert.equal("validateAfendaTokenizedTokens" in root, false);
  assert.equal("afendaDesignTokenExport" in tokens, false);
  assert.equal("afendaTokenUiDisplayTokens" in tokens, false);
  assert.equal("afendaTokenizedTokens" in tokens, false);
  assert.equal("validateAfendaTokenizedTokens" in tokens, false);

  assert.doesNotMatch(
    tokenCatalogSource,
    /afendaDesignTokenExport|afendaTokenUiDisplayTokens|afendaTokenizedTokens|validateAfendaTokenizedTokens/,
    "token catalog must not define removed compatibility aliases"
  );
  assert.doesNotMatch(
    tokenIndexSource,
    /afendaDesignTokenExport|afendaTokenUiDisplayTokens|afendaTokenizedTokens|validateAfendaTokenizedTokens/,
    "css token index must not re-export removed compatibility aliases"
  );
  assert.doesNotMatch(
    rootIndexSource,
    /afendaDesignTokenExport|afendaTokenUiDisplayTokens|afendaTokenizedTokens|validateAfendaTokenizedTokens/,
    "package root index must not re-export removed compatibility aliases"
  );
});

test("design system aggregate token groups stay removed after migration", async () => {
  const root = await import("@repo/design-system");
  const tokens = await import("@repo/design-system/css/tokens");
  const tokenIndexSource = readDesignSystemSource("css/tokens/index.ts");
  const rootIndexSource = readDesignSystemSource("index.ts");

  assert.equal("designSystemTokenGroups" in root, false);
  assert.equal("designSystemTokenGroups" in tokens, false);
  assert.doesNotMatch(
    tokenIndexSource,
    /\bdesignSystemTokenGroups\b|\bDesignSystemTokenGroups\b/,
    "css token index must not define or export the removed aggregate token groups"
  );
  assert.doesNotMatch(
    rootIndexSource,
    /\bdesignSystemTokenGroups\b|\bDesignSystemTokenGroups\b/,
    "package root index must not re-export the removed aggregate token groups"
  );
});

test("design system aggregate variant groups stay removed after migration", async () => {
  const root = await import("@repo/design-system");
  const cssIndexSource = readDesignSystemSource("css/index.ts");
  const rootIndexSource = readDesignSystemSource("index.ts");

  assert.equal("designSystemVariants" in root, false);
  assert.equal("designSystemVariantGroups" in root, false);
  assert.doesNotMatch(
    cssIndexSource,
    /from "\.\/variants";/,
    "css index must not re-export removed css variant shim"
  );
  assert.doesNotMatch(
    rootIndexSource,
    /\bdesignSystemVariants\b|\bdesignSystemVariantGroups\b|\bDesignSystemVariants\b|\bDesignSystemVariantGroups\b/,
    "package root index must not re-export removed aggregate variant groups or aliases"
  );
});

test("root package stays free of low-level token and variant constants", async () => {
  const root = await import("@repo/design-system");

  for (const exportName of ROOT_FORBIDDEN_TOKEN_EXPORTS) {
    assert.equal(exportName in root, false, `${exportName} must stay off the root package`);
  }
  for (const exportName of ROOT_FORBIDDEN_VARIANT_EXPORTS) {
    assert.equal(exportName in root, false, `${exportName} must stay off the root package`);
  }
  assert.equal("resolveAfendaRuntimeToken" in root, true);
  assert.equal("resolveAfendaRuntimeTokenSnapshot" in root, true);
});

test("css token subpath stays narrowed to catalog and runtime exports", async () => {
  const tokens = await import("@repo/design-system/css/tokens");
  const tokenIndexSource = readDesignSystemSource("css/tokens/index.ts");

  for (const exportName of TOKENS_FORBIDDEN_LOW_LEVEL_EXPORTS) {
    assert.equal(
      exportName in tokens,
      false,
      `${exportName} must stay off the css token public subpath`
    );
    assert.doesNotMatch(
      tokenIndexSource,
      new RegExp(`\\b${exportName}\\b`),
      `css token index must not mention low-level export ${exportName}`
    );
  }

  assert.equal("afendaTokenCatalog" in tokens, true);
  assert.equal("afendaTokenUiCatalog" in tokens, true);
  assert.equal("resolveAfendaRuntimeTokenSnapshot" in tokens, true);
});

test("root import boundary blocks low-level css token and variant re-exports", () => {
  const rootIndexSource = readDesignSystemSource("index.ts");
  const forbiddenRootExports = [
    ...ROOT_FORBIDDEN_TOKEN_EXPORTS,
    ...ROOT_FORBIDDEN_VARIANT_EXPORTS,
  ];

  assert.doesNotMatch(
    rootIndexSource,
    /from "\.\/css\/variants";/,
    "package root must not re-export css variant shim"
  );

  for (const exportName of forbiddenRootExports) {
    assert.doesNotMatch(
      rootIndexSource,
      new RegExp(`\\b${exportName}\\b`),
      `package root must not mention low-level export ${exportName}`
    );
  }

  assert.match(
    rootIndexSource,
    /resolveAfendaRuntimeTokenSnapshot/,
    "package root should keep app-facing runtime helpers"
  );
});

test("package exports do not expose low-level token implementation subpaths", () => {
  const packageJsonSource = readDesignSystemSource("../package.json");

  assert.doesNotMatch(
    packageJsonSource,
    /"\.\/css\/tokens\/\*"/,
    "package exports must not expose low-level css token implementation subpaths"
  );
  assert.doesNotMatch(
    packageJsonSource,
    /"\.\/css\/variants"/,
    "package exports must not expose removed css variant shim subpath"
  );
});
