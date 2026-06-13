#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const scopeArgument = process.argv.find((argument) =>
  argument.startsWith("--scope=")
);
const scope = scopeArgument?.replace("--scope=", "") ?? "all";
const checkedExtensions = new Set([".ts", ".tsx"]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);

const scanRoots = [
  {
    kind: "primitive",
    label: "shadcn primitives",
    root: path.join(root, "packages", "ui", "src", "components", "ui-shadcn"),
  },
  {
    kind: "compose",
    label: "ui compose",
    root: path.join(root, "packages", "ui", "src", "components", "compose"),
  },
  {
    kind: "app",
    label: "app workspace shell",
    root: path.join(root, "apps", "app", "app", "_components", "workspace"),
  },
  {
    kind: "metadata-ui",
    label: "metadata ui",
    root: path.join(root, "packages", "metadata-ui", "src"),
  },
];

const shadcnPrimitiveInteractionPatterns = [
  /\bhover:(?:bg|text|border|ring|shadow)-[^\s"'`)]+/g,
  /\bfocus-visible:(?:bg|text|border|ring|outline)-[^\s"'`)]+/g,
  /\bfocus-within:(?:bg|text|border|ring|outline)-[^\s"'`)]+/g,
  /\bactive:(?:bg|text|border|ring|shadow)-[^\s"'`)]+/g,
  /\bdisabled:(?:pointer-events|opacity|cursor)-[^\s"'`)]+/g,
  /\baria-disabled:(?:pointer-events|opacity|cursor)-[^\s"'`)]+/g,
  /\bdata-\[[^\]]+\]:(?:bg|text|border|ring|shadow|font)-[^\s"'`)]+/g,
  /\bgroup-data-\[[^\]]+\]:(?:bg|text|border|ring|shadow|font|size|p)-[^\s"'`)]+/g,
];

const adHocColorPatterns = [
  /\b(?:bg|text|border|ring|from|to|via)-\[(?:#[^\]]+|(?:rgb|hsl|oklch|color-mix)\([^\]]+\)|Canvas|CanvasText)[^\]]*\]/g,
  /\b(?:bg|text|border|ring|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d+)?\b/g,
];

const darkColorOverridePatterns = [
  /\bdark:(?:bg|text|border|ring|from|to|via)-[^\s"'`)]+/g,
];

const appShellInteractionConstants = [
  "WORKSPACE_SHELL_HOVER_CLASS",
  "WORKSPACE_SHELL_FOCUS_VISIBLE_CLASS",
  "WORKSPACE_SHELL_INTERACTIVE_CLASS",
  "WORKSPACE_SHELL_FOCUS_WITHIN_INTERACTIVE_CLASS",
  "WORKSPACE_SHELL_OPEN_CLASS",
  "WORKSPACE_SHELL_ACTIVE_CLASS",
];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
  return toPosix(path.relative(root, filePath));
}

function walk(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...walk(fullPath));
      }

      continue;
    }

    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function lineNumberForIndex(source, index) {
  let line = 1;

  for (let offset = 0; offset < index; offset += 1) {
    if (source.charCodeAt(offset) === 10) {
      line += 1;
    }
  }

  return line;
}

function collectMatches(source, patterns) {
  const matches = [];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      matches.push({
        index: match.index ?? 0,
        text: match[0],
      });
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}

function addFinding(findings, severity, filePath, source, message, match) {
  findings.push({
    file: relativeToRoot(filePath),
    line: lineNumberForIndex(source, match.index),
    message,
    severity,
    value: match.text,
  });
}

function scanFile(scanRoot, filePath) {
  const source = readFileSync(filePath, "utf8");
  const findings = [];
  const interactionMatches = collectMatches(
    source,
    shadcnPrimitiveInteractionPatterns
  );
  const adHocMatches = collectMatches(source, adHocColorPatterns);
  const darkOverrideMatches = collectMatches(source, darkColorOverridePatterns);

  if (scanRoot.kind === "primitive") {
    for (const match of interactionMatches) {
      addFinding(
        findings,
        "info",
        filePath,
        source,
        "primitive owns this interaction utility",
        match
      );
    }
  } else {
    for (const match of interactionMatches) {
      addFinding(
        findings,
        "warn",
        filePath,
        source,
        "composition/app layer declares interaction utility; prefer primitive variant or existing token behavior",
        match
      );
    }
  }

  for (const match of adHocMatches) {
    addFinding(
      findings,
      "warn",
      filePath,
      source,
      "ad-hoc color utility found; prefer semantic token utilities from globals.css",
      match
    );
  }

  for (const match of darkOverrideMatches) {
    addFinding(
      findings,
      scanRoot.kind === "primitive" ? "info" : "warn",
      filePath,
      source,
      scanRoot.kind === "primitive"
        ? "primitive owns this dark-mode override"
        : "composition/app dark-mode color override; prefer semantic tokens without dark: when possible",
      match
    );
  }

  for (const constantName of appShellInteractionConstants) {
    let index = source.indexOf(constantName);

    while (index !== -1) {
      addFinding(
        findings,
        scanRoot.kind === "app" ? "warn" : "info",
        filePath,
        source,
        "app-level shell interaction constant usage; review for duplicate primitive ownership",
        { index, text: constantName }
      );
      index = source.indexOf(constantName, index + constantName.length);
    }
  }

  for (const match of source.matchAll(/\bstyle\s*=\s*\{\{/g)) {
    addFinding(
      findings,
      "warn",
      filePath,
      source,
      "inline React style prop found; verify it is dynamic layout only, not token styling",
      { index: match.index ?? 0, text: match[0] }
    );
  }

  return findings;
}

function groupBy(items, getKey) {
  const grouped = new Map();

  for (const item of items) {
    const key = getKey(item);
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  return grouped;
}

const activeScanRoots =
  scope === "all"
    ? scanRoots
    : scanRoots.filter((scanRoot) => scanRoot.kind === scope);

if (activeScanRoots.length === 0) {
  console.error(
    `Unknown scope '${scope}'. Expected one of: all, primitive, compose, app, metadata-ui.`
  );
  process.exit(1);
}

const allFindings = [];

for (const scanRoot of activeScanRoots) {
  for (const filePath of walk(scanRoot.root)) {
    allFindings.push(
      ...scanFile(scanRoot, filePath).map((finding) => ({
        ...finding,
        owner: scanRoot.label,
      }))
    );
  }
}

const warnings = allFindings.filter((finding) => finding.severity === "warn");
const informational = allFindings.filter(
  (finding) => finding.severity === "info"
);

console.log("shadcn/Tailwind style ownership audit");
console.log("");
console.log(`Scope: ${scope}`);
console.log(`Scanned roots: ${activeScanRoots.length}`);
console.log(
  `Informational primitive-owned interactions: ${informational.length}`
);
console.log(`Review warnings: ${warnings.length}`);

if (warnings.length > 0) {
  console.log("");
  console.log("Review warnings:");

  const grouped = groupBy(warnings, (finding) => finding.file);

  for (const [file, findings] of grouped) {
    console.log(`\n${file}`);

    for (const finding of findings) {
      console.log(`  ${finding.line}: ${finding.message} -> ${finding.value}`);
    }
  }
}

if (informational.length > 0) {
  console.log("");
  console.log("Primitive-owned interaction summary:");

  const grouped = groupBy(informational, (finding) => finding.file);

  for (const [file, findings] of grouped) {
    console.log(`  ${file}: ${findings.length}`);
  }
}

if (strict && warnings.length > 0) {
  process.exit(1);
}
