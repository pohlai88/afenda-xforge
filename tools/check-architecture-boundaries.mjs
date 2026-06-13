#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);
const checkedExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const featureInternalSegments = new Set([
  "actions",
  "components",
  "forms",
  "queries",
  "tables",
  "tests",
]);
const legacyTokenAliasImports = new Set([
  "afendaDesignTokenExport",
  "afendaTokenUiDisplayTokens",
  "afendaTokenizedTokens",
  "validateAfendaTokenizedTokens",
]);
const hardcodedZIndexUtilityAllowComment = "xforge-allow-hardcoded-z";
const hardcodedZIndexUtilityAllowedPathPrefixes = [
  "apps/email/.react-email/",
];
const tokenVocabularyExportPattern = /\bexport\s+const\s+([A-Z0-9_]+)\s*=\s*\[/g;
const tokenVocabularyNamePattern =
  /(?:^|_)(?:ALIAS|ALIASES|ANIMATION|ANIMATIONS|FEATURE|FEATURES|ID|IDS|LANE|LANES|MODE|MODES|NAME|NAMES|PADDING|PREFERENCE|PREFERENCES|PRESET|PRESETS|PROVIDER|PROVIDERS|ROLE|ROLES|SIZE|SIZES|STATE|STATES|TOKEN|TOKENS|TONE|TONES|UTILITY|UTILITIES|VARIANT|VARIANTS)(?:_|$)/;
const hardcodedZIndexUtilityPattern =
  /(?:^|[\s"'`])((?:[^"'`\s]*:)*-?z-\d+\b|(?:[^"'`\s]*:)*z-\[[^\]]+\])/;
const legacyOrderLayerUtilityPattern =
  /(?:^|[\s"'`])((?:[^"'`\s]*:)*order-(?:background|base|ornament|raised|sticky|popover|overlay)\b)/;

const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
  return toPosix(path.relative(root, filePath));
}

function isIgnoredDirectory(name) {
  return ignoredDirectories.has(name);
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!isIgnoredDirectory(entry.name)) {
        files.push(...walk(path.join(directory, entry.name)));
      }

      continue;
    }

    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

function readPackageName(startDirectory) {
  let current = startDirectory;

  while (current.startsWith(root)) {
    const packagePath = path.join(current, "package.json");

    if (existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
        return typeof packageJson.name === "string" ? packageJson.name : null;
      } catch {
        return null;
      }
    }

    const parent = path.dirname(current);

    if (parent === current) {
      return null;
    }

    current = parent;
  }

  return null;
}

function extractImports(source) {
  const imports = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s*)["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.add(match[1]);
    }
  }

  return [...imports];
}

function extractNamedImportBindings(source) {
  const bindings = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[2];
      const names = match[1]
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) =>
          part
            .replace(/^type\s+/, "")
            .split(/\s+as\s+/i)[0]
            .trim()
        );

      bindings.push({ names, specifier });
    }
  }

  return bindings;
}

function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.mjs`,
    `${basePath}.mts`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const stat = statSync(candidate);
      return stat.isDirectory() ? null : candidate;
    }
  }

  return basePath;
}

function getFeatureRoot(filePath) {
  const relative = relativeToRoot(filePath);
  const parts = relative.split("/");

  if (
    parts[0] === "packages" &&
    parts[1] === "features" &&
    parts[2] !== "_integration" &&
    parts.length >= 4
  ) {
    return parts.slice(0, 4).join("/");
  }

  return null;
}

function getResolvedFeatureRoot(fromFile, specifier) {
  const resolved = resolveRelativeImport(fromFile, specifier);

  if (resolved) {
    return getFeatureRoot(resolved);
  }

  return null;
}

function getFeatureAliasPackage(specifier) {
  const match = specifier.match(/^(@repo\/features-[^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function getFeatureInternalSegmentFromSpecifier(specifier) {
  const match = specifier.match(/^@repo\/features-[^/]+\/([^/]+)/);

  if (match && featureInternalSegments.has(match[1])) {
    return match[1];
  }

  return null;
}

function getFeatureInternalSegmentFromResolvedPath(resolvedPath) {
  const relative = relativeToRoot(resolvedPath);
  const parts = relative.split("/");

  if (parts[0] !== "packages" || parts[1] !== "features" || parts.length < 6) {
    return null;
  }

  const srcIndex = parts.indexOf("src");
  const segment = srcIndex >= 0 ? parts[srcIndex + 1] : null;
  const basename = path.basename(relative, path.extname(relative));

  if (segment && featureInternalSegments.has(segment)) {
    return segment;
  }

  if (featureInternalSegments.has(basename)) {
    return basename;
  }

  return null;
}

function isAppOrOrchestration(filePath) {
  const relative = relativeToRoot(filePath);
  return (
    relative.startsWith("apps/") ||
    relative.startsWith("packages/features/_integration/") ||
    relative.startsWith("packages/machine/")
  );
}

function isClientComponent(source) {
  return /^\s*["']use client["'];?/.test(source);
}

function isUiPackage(filePath) {
  const relative = relativeToRoot(filePath);
  return (
    relative.startsWith("packages/ui/") ||
    relative.startsWith("packages/design-system/")
  );
}

function isMetadataUiPackage(filePath) {
  const relative = relativeToRoot(filePath);
  return relative.startsWith("packages/metadata-ui/");
}

function isCustomizationPackage(filePath) {
  const relative = relativeToRoot(filePath);
  return relative.startsWith("packages/customization/");
}

function isMetadataFile(filePath) {
  const relative = relativeToRoot(filePath);
  return (
    relative.startsWith("packages/metadata/") ||
    /(^|\/)metadata\.(ts|tsx|js|jsx|mjs|mts)$/.test(relative)
  );
}

function isTestLikeFile(filePath) {
  const relative = relativeToRoot(filePath);

  return (
    relative.includes("/tests/") ||
    relative.includes("/__tests__/") ||
    /\.(test|spec)\.(ts|tsx|js|jsx|mjs|mts)$/.test(relative)
  );
}

function isDesignSystemSourceFile(filePath) {
  return relativeToRoot(filePath).startsWith("packages/design-system/src/");
}

function addViolation(filePath, message) {
  violations.push(`${relativeToRoot(filePath)}: ${message}`);
}

function checkImport(filePath, source, specifier, packageName) {
  const resolvedPath = resolveRelativeImport(filePath, specifier);

  checkFeatureIsolation(filePath, specifier, packageName);
  checkAppFeatureEntrypoints(filePath, specifier, resolvedPath);
  checkClientServerImports(filePath, source, specifier, resolvedPath);
  checkUiPackageImports(filePath, specifier, resolvedPath);
  checkMetadataUiImports(filePath, specifier, resolvedPath);
  checkCustomizationImports(filePath, specifier, resolvedPath);
  checkMetadataImports(filePath, specifier, resolvedPath);
}

function checkFeatureIsolation(filePath, specifier, packageName) {
  const currentFeatureRoot = getFeatureRoot(filePath);
  const resolvedFeatureRoot =
    getResolvedFeatureRoot(filePath, specifier) ?? null;
  const featureAliasPackage = getFeatureAliasPackage(specifier);

  if (currentFeatureRoot) {
    if (resolvedFeatureRoot && resolvedFeatureRoot !== currentFeatureRoot) {
      addViolation(
        filePath,
        `feature packages must not import sibling feature internals: ${specifier}`
      );
    }

    if (featureAliasPackage && featureAliasPackage !== packageName) {
      addViolation(
        filePath,
        `feature packages must not import other feature packages: ${specifier}`
      );
    }
  }
}

function checkAppFeatureEntrypoints(filePath, specifier, resolvedPath) {
  if (isAppOrOrchestration(filePath)) {
    const internalSegment =
      getFeatureInternalSegmentFromSpecifier(specifier) ??
      (resolvedPath
        ? getFeatureInternalSegmentFromResolvedPath(resolvedPath)
        : null);

    if (internalSegment) {
      addViolation(
        filePath,
        `apps and orchestration must use feature server/index entrypoints, not ${internalSegment}: ${specifier}`
      );
    }
  }
}

function isServerOnlyFile(resolvedPath) {
  if (!(resolvedPath && existsSync(resolvedPath))) {
    return false;
  }

  const stat = statSync(resolvedPath);

  if (!stat.isFile()) {
    return false;
  }

  return /\bimport\s+["']server-only["']/.test(
    readFileSync(resolvedPath, "utf8")
  );
}

function isForbiddenClientFeatureImport(specifier) {
  const match = specifier.match(/^@repo\/features-[^/]+(?:\/([^/]+))?$/);

  if (!match) {
    return false;
  }

  const subpath = match[1] ?? null;

  return (
    subpath === null ||
    subpath === "actions" ||
    subpath === "execution" ||
    subpath === "queries" ||
    subpath === "server"
  );
}

function isForbiddenClientAuthImport(specifier) {
  if (specifier === "@repo/auth") {
    return true;
  }

  return (
    specifier === "@repo/auth/server" ||
    specifier === "@repo/auth/proxy" ||
    specifier.startsWith("@repo/auth/server/") ||
    specifier.startsWith("@repo/auth/proxy/")
  );
}

function checkClientServerImports(filePath, source, specifier, resolvedPath) {
  if (!isClientComponent(source)) {
    return;
  }

  const resolvedRelativePath = resolvedPath ? relativeToRoot(resolvedPath) : "";
  const importsForbiddenServerCode =
    specifier === "@repo/database" ||
    specifier.startsWith("@repo/database/") ||
    specifier === "@repo/audit" ||
    specifier.startsWith("@repo/audit/") ||
    specifier === "@repo/logger" ||
    specifier.startsWith("@repo/logger/") ||
    specifier === "@repo/execution" ||
    specifier.startsWith("@repo/execution/") ||
    isForbiddenClientAuthImport(specifier) ||
    isForbiddenClientFeatureImport(specifier) ||
    isServerOnlyFile(resolvedPath) ||
    resolvedRelativePath.startsWith("packages/database/") ||
    resolvedRelativePath.startsWith("packages/audit/") ||
    resolvedRelativePath.startsWith("packages/logger/") ||
    resolvedRelativePath.startsWith("packages/execution/");

  if (importsForbiddenServerCode) {
    addViolation(
      filePath,
      `client components must not import server-only runtime code: ${specifier}`
    );
  }
}

function checkUiPackageImports(filePath, specifier, resolvedPath) {
  if (isUiPackage(filePath)) {
    const allowedUiImports = new Set([
      "@repo/design-system",
      "@repo/typescript-config",
    ]);
    const importsForbiddenRuntime =
      (specifier.startsWith("@repo/") &&
        ![...allowedUiImports].some(
          (allowed) =>
            specifier === allowed || specifier.startsWith(`${allowed}/`)
        )) ||
      (resolvedPath &&
        (relativeToRoot(resolvedPath).startsWith("packages/database/") ||
          relativeToRoot(resolvedPath).startsWith("packages/auth/") ||
          relativeToRoot(resolvedPath).startsWith("packages/features/") ||
          relativeToRoot(resolvedPath).startsWith("packages/execution/") ||
          relativeToRoot(resolvedPath).startsWith("packages/audit/") ||
          relativeToRoot(resolvedPath).startsWith("packages/logger/") ||
          relativeToRoot(resolvedPath).startsWith("packages/permissions/") ||
          relativeToRoot(resolvedPath).startsWith("packages/search/") ||
          relativeToRoot(resolvedPath).startsWith("packages/metadata/") ||
          relativeToRoot(resolvedPath).startsWith("packages/metadata-ui/")));

    if (importsForbiddenRuntime) {
      addViolation(
        filePath,
        `UI packages must stay presentational and must not import runtime/business packages: ${specifier}`
      );
    }
  }
}

function checkMetadataUiImports(filePath, specifier, resolvedPath) {
  if (isMetadataUiPackage(filePath)) {
    if (relativeToRoot(filePath).includes("/tests/")) {
      return;
    }
    const allowedMetadataUiImports = new Set([
      "@repo/customization",
      "@repo/metadata",
      "@repo/ui",
    ]);
    const importsForbiddenRuntime =
      (specifier.startsWith("@repo/") &&
        ![...allowedMetadataUiImports].some(
          (allowed) =>
            specifier === allowed || specifier.startsWith(`${allowed}/`)
        )) ||
      (resolvedPath &&
        (relativeToRoot(resolvedPath).startsWith("packages/database/") ||
          relativeToRoot(resolvedPath).startsWith("packages/auth/") ||
          relativeToRoot(resolvedPath).startsWith("packages/features/") ||
          relativeToRoot(resolvedPath).startsWith("packages/execution/") ||
          relativeToRoot(resolvedPath).startsWith("packages/audit/") ||
          relativeToRoot(resolvedPath).startsWith("packages/logger/") ||
          relativeToRoot(resolvedPath).startsWith("packages/permissions/") ||
          relativeToRoot(resolvedPath).startsWith("packages/search/")));

    if (importsForbiddenRuntime) {
      addViolation(
        filePath,
        `@repo/metadata-ui must only import @repo/ui, @repo/metadata, and @repo/customization, not ${specifier}`
      );
    }
  }
}

function checkCustomizationImports(filePath, specifier, resolvedPath) {
  if (!isCustomizationPackage(filePath)) {
    return;
  }

  const allowedCustomizationImports = new Set([
    "@repo/metadata",
    "@repo/shared",
  ]);
  const importsForbiddenRuntime =
    (specifier.startsWith("@repo/") &&
      ![...allowedCustomizationImports].some(
        (allowed) =>
          specifier === allowed || specifier.startsWith(`${allowed}/`)
      )) ||
    (resolvedPath &&
      [
        "packages/ui/",
        "packages/metadata-ui/",
        "packages/database/",
        "packages/auth/",
        "packages/features/",
        "packages/execution/",
        "packages/audit/",
        "packages/logger/",
        "packages/permissions/",
        "packages/search/",
      ].some((prefix) => relativeToRoot(resolvedPath).startsWith(prefix)));

  if (importsForbiddenRuntime) {
    addViolation(
      filePath,
      `@repo/customization must stay declarative and must not import runtime/business packages: ${specifier}`
    );
  }
}

function checkMetadataImports(filePath, specifier, resolvedPath) {
  if (isMetadataFile(filePath)) {
    const importsBusinessAuthority =
      specifier === "@repo/database" ||
      specifier.startsWith("@repo/database/") ||
      specifier === "@repo/execution" ||
      specifier.startsWith("@repo/execution/") ||
      specifier === "@repo/permissions" ||
      specifier.startsWith("@repo/permissions/") ||
      specifier === "@repo/audit" ||
      specifier.startsWith("@repo/audit/") ||
      (resolvedPath &&
        [
          "packages/database/",
          "packages/execution/",
          "packages/permissions/",
          "packages/audit/",
        ].some((prefix) => relativeToRoot(resolvedPath).startsWith(prefix)));

    if (importsBusinessAuthority) {
      addViolation(
        filePath,
        `metadata must stay declarative and must not import business authority packages: ${specifier}`
      );
    }
  }
}

function checkFeatureActionFile(filePath, source) {
  const relative = relativeToRoot(filePath);

  if (
    !/^packages\/features\/.+\/src\/actions\.(ts|tsx|js|jsx|mjs|mts)$/.test(
      relative
    )
  ) {
    return;
  }

  if (!/from\s+["'](?:\.\/execution|@repo\/execution)/.test(source)) {
    addViolation(
      filePath,
      "feature actions must call the canonical execution pipeline through ./execution or @repo/execution"
    );
  }

  if (source.includes("createExecutionPipeline")) {
    if (!/writeAuditEvent\s*:/.test(source)) {
      addViolation(
        filePath,
        "feature actions that use the execution pipeline must wire a writeAuditEvent hook"
      );
    }

    if (!/runInTransaction\s*:/.test(source)) {
      addViolation(
        filePath,
        "feature actions that use the execution pipeline must wire runInTransaction so audit writes stay atomic"
      );
    }
  }
}

function checkLegacyTokenAliasImports(filePath, source) {
  if (isTestLikeFile(filePath)) {
    return;
  }

  for (const { names, specifier } of extractNamedImportBindings(source)) {
    for (const name of names) {
      if (legacyTokenAliasImports.has(name)) {
        addViolation(
          filePath,
          `legacy token alias imports are forbidden after hard migration: ${name} from ${specifier}`
        );
      }
    }
  }
}

function checkTokenVocabularyPlacement(filePath, source) {
  if (isTestLikeFile(filePath) || !isDesignSystemSourceFile(filePath)) {
    return;
  }

  const relative = relativeToRoot(filePath);
  const isContractsLayer =
    relative.startsWith("packages/design-system/src/contracts/");

  if (!isContractsLayer && /\bdefineRegistry\(/.test(source)) {
    addViolation(
      filePath,
      "manual registry vocabulary is only allowed inside packages/design-system/src/contracts/**"
    );
  }

  if (isContractsLayer) {
    return;
  }

  for (const match of source.matchAll(tokenVocabularyExportPattern)) {
    if (
      !match[1].startsWith("GLOBALS_CSS_") &&
      tokenVocabularyNamePattern.test(match[1])
    ) {
      addViolation(
        filePath,
        `token vocabulary must be defined only inside packages/design-system/src/contracts/**: ${match[1]}`
      );
    }
  }
}

function checkHardcodedZIndexUtilities(filePath, source) {
  if (isTestLikeFile(filePath)) {
    return;
  }

  const relative = relativeToRoot(filePath);
  const isSourceFile =
    relative.startsWith("apps/") || relative.startsWith("packages/");

  if (!isSourceFile) {
    return;
  }

  if (
    hardcodedZIndexUtilityAllowedPathPrefixes.some((prefix) =>
      relative.startsWith(prefix)
    )
  ) {
    return;
  }

  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const match = line.match(hardcodedZIndexUtilityPattern);

    if (!match) {
      continue;
    }

    const previousLine = lines[index - 1] ?? "";
    const isSanctionedMigrationException =
      line.includes(hardcodedZIndexUtilityAllowComment) ||
      previousLine.includes(hardcodedZIndexUtilityAllowComment);

    if (isSanctionedMigrationException) {
      continue;
    }

    addViolation(
      filePath,
      `hard-coded z-index utilities are forbidden; use governed z-layer-* utilities instead (${match[1]}). Temporary migration exceptions must be annotated with ${hardcodedZIndexUtilityAllowComment}.`
    );
  }
}

function checkLegacyOrderLayerUtilities(filePath, source) {
  if (isTestLikeFile(filePath)) {
    return;
  }

  const relative = relativeToRoot(filePath);
  const isSourceFile =
    relative.startsWith("apps/") || relative.startsWith("packages/");

  if (!isSourceFile) {
    return;
  }

  const match = source.match(legacyOrderLayerUtilityPattern);

  if (match) {
    addViolation(
      filePath,
      `legacy order-* z-layer utility is forbidden; use z-layer-* instead (${match[1]}).`
    );
  }
}

for (const filePath of walk(root)) {
  const source = readFileSync(filePath, "utf8");
  const packageName = readPackageName(path.dirname(filePath));

  for (const specifier of extractImports(source)) {
    checkImport(filePath, source, specifier, packageName);
  }

  checkFeatureActionFile(filePath, source);
  checkLegacyTokenAliasImports(filePath, source);
  checkTokenVocabularyPlacement(filePath, source);
  checkHardcodedZIndexUtilities(filePath, source);
  checkLegacyOrderLayerUtilities(filePath, source);
}

if (violations.length > 0) {
  console.error("Architecture boundary violations found:\n");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("Architecture boundary check passed.");
