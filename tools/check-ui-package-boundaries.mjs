#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const checkedExtensions = new Set([
  ".js",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
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

const packageRoots = {
  customization: path.join(root, "packages", "customization"),
  designSystem: path.join(root, "packages", "design-system"),
  metadata: path.join(root, "packages", "metadata"),
  metadataUi: path.join(root, "packages", "metadata-ui"),
  ui: path.join(root, "packages", "ui"),
};

const appRoots = existsSync(path.join(root, "apps"))
  ? readdirSync(path.join(root, "apps"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, "apps", entry.name))
  : [];

const allowedWorkspaceDependenciesByPackage = {
  "@repo/customization": new Set([
    "@repo/metadata",
    "@repo/shared",
    "@repo/typescript-config",
  ]),
  "@repo/design-system": new Set(["@repo/typescript-config"]),
  "@repo/metadata": new Set(["@repo/typescript-config"]),
  "@repo/metadata-ui": new Set([
    "@repo/customization",
    "@repo/metadata",
    "@repo/typescript-config",
    "@repo/ui",
  ]),
  "@repo/ui": new Set(["@repo/design-system", "@repo/typescript-config"]),
};

const businessRuntimePrefixes = [
  "@repo/audit",
  "@repo/auth",
  "@repo/database",
  "@repo/execution",
  "@repo/features-",
  "@repo/logger",
  "@repo/customization",
  "@repo/metadata",
  "@repo/metadata-ui",
  "@repo/permissions",
  "@repo/search",
];

const uiRepoImports = new Set([
  "@repo/design-system",
  "@repo/typescript-config",
]);

const metadataUiRepoImports = new Set([
  "@repo/customization",
  "@repo/metadata",
  "@repo/typescript-config",
  "@repo/ui",
]);

const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
  return toPosix(path.relative(root, filePath));
}

function addViolation(message) {
  violations.push(message);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
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

function getPackageKind(filePath) {
  const relativePath = relativeToRoot(filePath);

  if (relativePath.startsWith("packages/design-system/")) {
    return "designSystem";
  }

  if (relativePath.startsWith("packages/ui/")) {
    return "ui";
  }

  if (relativePath.startsWith("packages/metadata-ui/")) {
    return "metadataUi";
  }

  if (relativePath.startsWith("packages/customization/")) {
    return "customization";
  }

  if (relativePath.startsWith("packages/metadata/")) {
    return "metadata";
  }

  if (relativePath.startsWith("apps/")) {
    return "app";
  }

  return null;
}

function checkRequiredDesignSystemScaffold() {
  const requiredFiles = [
    "architecture.md",
    "src/index.ts",
    "src/tokens/index.ts",
    "src/contracts/index.ts",
    "src/variants/index.ts",
  ];

  for (const relativeFile of requiredFiles) {
    const filePath = path.join(packageRoots.designSystem, relativeFile);

    if (!existsSync(filePath)) {
      addViolation(
        `packages/design-system must include ${relativeToRoot(filePath)}`
      );
    }
  }
}

function checkWorkspaceDependencies() {
  for (const packageRoot of Object.values(packageRoots)) {
    const packageJson = readJson(path.join(packageRoot, "package.json"));
    const packageName = packageJson.name;
    const allowedWorkspaceDependencies =
      allowedWorkspaceDependenciesByPackage[packageName];
    const declaredWorkspaceDependencies = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ].filter((dependencyName) => dependencyName.startsWith("@repo/"));

    for (const dependencyName of declaredWorkspaceDependencies) {
      if (!allowedWorkspaceDependencies?.has(dependencyName)) {
        addViolation(
          `${packageName} must not declare workspace dependency ${dependencyName}`
        );
      }
    }
  }
}

function checkBusinessRuntimeImports(filePath, packageKind, specifier) {
  if (packageKind !== "designSystem" && packageKind !== "metadata") {
    return;
  }

  if (
    businessRuntimePrefixes.some(
      (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`)
    )
  ) {
    addViolation(
      `${relativeToRoot(filePath)}: ${packageKind} must not import runtime/business packages: ${specifier}`
    );
  }
}

function checkCrossPackageImports(filePath, packageKind, specifier) {
  const extension = path.extname(filePath);
  const isDocumentationFile = extension === ".md" || extension === ".mdx";
  const relativePath = relativeToRoot(filePath);

  if (isDocumentationFile) {
    return;
  }

  if (
    relativePath === "packages/metadata-ui/fixtures/public-api-consumer.tsx" &&
    (specifier === "@repo/metadata-ui" ||
      specifier.startsWith("@repo/metadata-ui/"))
  ) {
    return;
  }

  if (
    relativePath ===
      "packages/metadata-ui/tests/public-api-consumer.render.test.tsx" &&
    (specifier === "@repo/metadata-ui" ||
      specifier.startsWith("@repo/metadata-ui/"))
  ) {
    return;
  }

  if (packageKind !== "ui" && specifier.startsWith("@repo/ui/")) {
    addViolation(
      `${relativePath}: non-ui packages must import @repo/ui from the root surface only, not ${specifier}`
    );
  }

  if (
    packageKind === "designSystem" &&
    (specifier === "@repo/ui" ||
      specifier === "@repo/metadata" ||
      specifier.startsWith("@repo/metadata/") ||
      specifier === "@repo/metadata-ui" ||
      specifier.startsWith("@repo/metadata-ui/"))
  ) {
    addViolation(
      `${relativePath}: @repo/design-system must stay vocabulary-only and must not import ${specifier}`
    );
  }

  if (
    packageKind === "ui" &&
    specifier.startsWith("@repo/") &&
    ![...uiRepoImports].some(
      (allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`)
    )
  ) {
    addViolation(
      `${relativePath}: @repo/ui must only import design-system primitives and must not import ${specifier}`
    );
  }

  if (
    packageKind === "metadataUi" &&
    specifier.startsWith("@repo/") &&
    ![...metadataUiRepoImports].some(
      (allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`)
    )
  ) {
    addViolation(
      `${relativePath}: @repo/metadata-ui must only import @repo/ui, @repo/metadata, and @repo/customization, not ${specifier}`
    );
  }

  if (
    packageKind === "customization" &&
    specifier.startsWith("@repo/") &&
    !["@repo/metadata", "@repo/shared"].some(
      (allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`)
    )
  ) {
    addViolation(
      `${relativePath}: @repo/customization must only import @repo/metadata or @repo/shared, not ${specifier}`
    );
  }
}

function checkImports() {
  for (const packageRoot of [...Object.values(packageRoots), ...appRoots]) {
    for (const filePath of walk(packageRoot)) {
      const packageKind = getPackageKind(filePath);

      if (!packageKind) {
        continue;
      }

      const source = readFileSync(filePath, "utf8");
      const imports = extractImports(source);

      for (const specifier of imports) {
        checkBusinessRuntimeImports(filePath, packageKind, specifier);
        checkCrossPackageImports(filePath, packageKind, specifier);
      }
    }
  }
}

function getComposeDirectory() {
  return path.join(packageRoots.ui, "src", "components", "compose");
}

function getComposeRegistryNames() {
  const registryPath = path.join(getComposeDirectory(), "compose.registry.ts");
  const registrySource = readFileSync(registryPath, "utf8");

  return new Set(
    [...registrySource.matchAll(/^\s*name:\s*"([^"]+)",/gm)].map(
      (match) => match[1]
    )
  );
}

function getComposeRegistryReadinessByName() {
  const registryPath = path.join(getComposeDirectory(), "compose.registry.ts");
  const registrySource = readFileSync(registryPath, "utf8");
  const readinessByName = new Map();

  for (const match of registrySource.matchAll(
    /name:\s*"([^"]+)",[\s\S]*?readiness:\s*"(metadata-ready|preview-only)"/g
  )) {
    readinessByName.set(match[1], match[2]);
  }

  return readinessByName;
}

function checkComposeRegistryCompleteness() {
  const composeDirectory = getComposeDirectory();
  const registryNames = getComposeRegistryNames();
  const readinessByName = getComposeRegistryReadinessByName();
  const catalogNames = new Set(
    walk(composeDirectory)
      .filter((filePath) => filePath.endsWith(".catalog.ts"))
      .map((filePath) => path.basename(path.dirname(filePath)))
  );
  const familyNames = readdirSync(composeDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "_previews")
    .map((entry) => entry.name)
    .sort();

  for (const familyName of familyNames) {
    if (!registryNames.has(familyName)) {
      addViolation(
        `packages/ui compose family '${familyName}' must be represented in compose.registry.ts`
      );
    }
  }

  for (const registryName of registryNames) {
    if (!familyNames.includes(registryName)) {
      addViolation(
        `packages/ui compose.registry.ts references missing compose family '${registryName}'`
      );
    }
  }

  for (const familyName of familyNames) {
    const readiness = readinessByName.get(familyName);

    if (readiness !== "preview-only" && !catalogNames.has(familyName)) {
      addViolation(
        `packages/ui compose family '${familyName}' is ${readiness ?? "unknown"} and must provide a *.catalog.ts file unless it is preview-only`
      );
    }
  }
}

function checkComposeRegistryIsSerializable() {
  const registryPath = path.join(getComposeDirectory(), "compose.registry.ts");
  const registrySource = readFileSync(registryPath, "utf8");
  const imports = extractImports(registrySource);

  for (const specifier of imports) {
    if (specifier !== "./compose.contract") {
      addViolation(
        `${relativeToRoot(registryPath)}: compose registry must stay metadata-only and must not import ${specifier}`
      );
    }
  }

  if (/\bcomponent\s*:/.test(registrySource)) {
    addViolation(
      `${relativeToRoot(registryPath)}: compose registry must not include React component references`
    );
  }
}

function checkComposePublicSurface() {
  const composeDirectory = getComposeDirectory();
  const forbiddenPublicExportPattern =
    /\b(MediaPreviewDialog|AvatarEmptyStateExample|DemoAvatar|DemoFile|GalleryUpload|galleryFiles|demoBoard|PreviewKanban)\b/;
  const publicEntryFiles = [
    path.join(composeDirectory, "index.ts"),
    ...readdirSync(composeDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "_previews")
      .map((entry) => path.join(composeDirectory, entry.name, "index.ts"))
      .filter((filePath) => existsSync(filePath)),
  ];

  for (const filePath of publicEntryFiles) {
    const source = readFileSync(filePath, "utf8");

    if (forbiddenPublicExportPattern.test(source)) {
      addViolation(
        `${relativeToRoot(filePath)}: compose public barrels must not expose demo, preview, or gallery-only symbols`
      );
    }
  }
}

function checkComposeRenderRegistry() {
  const renderersPath = path.join(
    getComposeDirectory(),
    "compose.renderers.ts"
  );

  if (!existsSync(renderersPath)) {
    addViolation(
      `packages/ui compose render registry must exist at ${relativeToRoot(renderersPath)}`
    );
    return;
  }

  const renderersSource = readFileSync(renderersPath, "utf8");
  const renderableGroupNames = new Set(
    [...renderersSource.matchAll(/createRenderableCatalog\(\s*"([^"]+)"/g)].map(
      (match) => match[1]
    )
  );
  const readinessByName = getComposeRegistryReadinessByName();

  for (const specifier of extractImports(renderersSource)) {
    if (specifier.startsWith("./_previews/")) {
      addViolation(
        `${relativeToRoot(renderersPath)}: compose render registry must not import preview-only compose assets: ${specifier}`
      );
    }
  }

  for (const [familyName, readiness] of readinessByName) {
    if (
      readiness === "metadata-ready" &&
      !renderableGroupNames.has(familyName)
    ) {
      addViolation(
        `${relativeToRoot(renderersPath)}: metadata-ready compose family '${familyName}' must be represented in compose.renderers.ts`
      );
    }

    if (readiness === "preview-only" && renderableGroupNames.has(familyName)) {
      addViolation(
        `${relativeToRoot(renderersPath)}: preview-only compose family '${familyName}' must not be represented in compose.renderers.ts`
      );
    }
  }

  for (const familyName of renderableGroupNames) {
    if (!readinessByName.has(familyName)) {
      addViolation(
        `${relativeToRoot(renderersPath)}: compose render registry references unknown compose family '${familyName}'`
      );
    }
  }
}

checkRequiredDesignSystemScaffold();
checkWorkspaceDependencies();
checkImports();
checkComposeRegistryCompleteness();
checkComposeRegistryIsSerializable();
checkComposeRenderRegistry();
checkComposePublicSurface();

if (violations.length > 0) {
  console.error("UI/design-system/metadata boundary violations found:\n");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("UI/design-system/metadata boundary check passed.");
