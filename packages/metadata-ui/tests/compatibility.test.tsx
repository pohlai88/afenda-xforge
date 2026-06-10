import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import { resolveFromModule } from "../scripts/module-location.mts";
import {
  createMetadataRenderContext,
  createMetadataUiCompatibilityReport,
  defaultActionRegistry,
  defaultFieldRegistry,
  defaultSectionRegistry,
  metadataUiComposeCompatibilityMap,
  resolveMetadataActionRenderer,
  resolveMetadataFieldRenderer,
  resolveMetadataSectionRenderer,
  resolveMetadataStateRenderer,
} from "../src";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const srcRoot = resolveFromModule(import.meta.url, "../src");
const contractsRoot = resolveFromModule(import.meta.url, "../src/contracts");

const getSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getSourceFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

test("metadata-ui compatibility report covers every default renderer and compose group", () => {
  const report = createMetadataUiCompatibilityReport();

  assert.equal(report.ok, true);
  assert.deepEqual(report.issues, []);
  assert.deepEqual(
    [...report.checked.field].sort(),
    Object.keys(metadataUiComposeCompatibilityMap.field).sort()
  );
  assert.deepEqual(
    [...report.checked.action].sort(),
    Object.keys(metadataUiComposeCompatibilityMap.action).sort()
  );
  assert.deepEqual(
    [...report.checked.section].sort(),
    Object.keys(metadataUiComposeCompatibilityMap.section).sort()
  );
  assert.deepEqual(
    [...report.checked.state].sort(),
    Object.keys(metadataUiComposeCompatibilityMap.state).sort()
  );
});

test("metadata renderer resolvers resolve every supported default key", () => {
  for (const key of defaultFieldRegistry.keys()) {
    const resolution = resolveMetadataFieldRenderer(key);

    assert.equal(resolution.diagnostic, undefined);
    assert.equal(typeof resolution.renderer, "function");
  }

  for (const key of defaultActionRegistry.keys()) {
    const resolution = resolveMetadataActionRenderer(key);

    assert.equal(resolution.diagnostic, undefined);
    assert.equal(typeof resolution.renderer, "function");
  }

  for (const key of defaultSectionRegistry.keys()) {
    const resolution = resolveMetadataSectionRenderer(key);

    assert.equal(resolution.diagnostic, undefined);
    assert.equal(typeof resolution.renderer, "function");
  }

  for (const key of Object.keys(metadataUiComposeCompatibilityMap.state)) {
    const resolution = resolveMetadataStateRenderer(key);

    assert.equal(resolution.diagnostic, undefined);
    assert.equal(typeof resolution.renderer, "function");
  }
});

test("metadata renderer resolvers fall back for unknown runtime keys", () => {
  const context = createMetadataRenderContext(undefined, { mode: "read" });

  const fieldResolution = resolveMetadataFieldRenderer("unknown-field");
  const fieldElement = fieldResolution.renderer({
    context,
    field: {
      key: "legacy",
      kind: "unknown-field" as never,
      label: "Legacy Field",
    },
  }) as TestElement;

  assert.equal(fieldResolution.diagnostic?.rendererType, "field");
  assert.equal((fieldElement.type as { name?: string }).name, "ErrorState");

  const actionResolution = resolveMetadataActionRenderer("unknown-action");
  const actionElement = actionResolution.renderer({
    action: {
      key: "legacy",
      kind: "unknown-action" as never,
      label: "Legacy Action",
    },
    context,
  }) as TestElement;

  assert.equal(actionResolution.diagnostic?.rendererType, "action");
  assert.equal((actionElement.type as { name?: string }).name, "ErrorState");

  const sectionResolution = resolveMetadataSectionRenderer("unknown-section");
  const sectionElement = sectionResolution.renderer({
    context,
    section: {
      key: "legacy",
      kind: "unknown-section" as never,
      title: "Legacy Section",
    },
  }) as TestElement;

  assert.equal(sectionResolution.diagnostic?.rendererType, "section");
  assert.equal((sectionElement.type as { name?: string }).name, "ErrorState");

  const stateResolution = resolveMetadataStateRenderer("unknown-state");
  const stateElement = stateResolution.renderer({}) as TestElement;

  assert.equal(stateResolution.diagnostic?.rendererType, "state");
  assert.equal((stateElement.type as { name?: string }).name, "ErrorState");
});

test("metadata-ui source keeps the ui integration boundary clean", () => {
  const forbiddenImportPatterns = [
    /from\s+["']@repo\/ui\/components\/compose\/(?:_previews|previews)(?:\/|["'])/,
    /from\s+["']@repo\/(?:database|auth|execution|audit)(?:\/|["'])/,
    /from\s+["']@repo\/design-system(?:\/|["'])/,
  ];

  for (const filePath of getSourceFiles(srcRoot)) {
    const source = readFileSync(filePath, "utf8");

    for (const pattern of forbiddenImportPatterns) {
      assert.equal(
        pattern.test(source),
        false,
        `Forbidden metadata-ui import in ${filePath}`
      );
    }
  }
});

test("metadata-ui contracts stay decoupled from upstream metadata and ui packages", () => {
  const forbiddenContractImportPatterns = [
    /from\s+["']@repo\/metadata(?:\/|["'])/,
    /from\s+["']@repo\/ui(?:\/|["'])/,
  ];

  for (const filePath of getSourceFiles(contractsRoot)) {
    const source = readFileSync(filePath, "utf8");

    for (const pattern of forbiddenContractImportPatterns) {
      assert.equal(
        pattern.test(source),
        false,
        `Forbidden contract dependency in ${filePath}`
      );
    }
  }
});
