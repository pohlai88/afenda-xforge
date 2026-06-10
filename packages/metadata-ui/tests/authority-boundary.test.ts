import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { checkAuthorityBoundary } from "../scripts/check-authority-boundary.mts";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { evaluateMetadataGovernance } from "../src/policy/governance";
import { test } from "./test-runtime";

const packageRoot = join(import.meta.dirname, "..");
const srcRoot = join(packageRoot, "src");
const contractsRoot = join(srcRoot, "contracts");
const componentsRoot = join(srcRoot, "components");

const walkTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkTypeScriptFiles(fullPath);
    }

    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

test("Enterprise AC #5 authority boundary gate passes", () => {
  checkAuthorityBoundary();
});

test("metadata-ui contracts stay decoupled from upstream metadata, ui, and customization packages", () => {
  const forbiddenContractImportPatterns = [
    /from\s+["']@repo\/metadata(?:\/|["'])/,
    /from\s+["']@repo\/ui(?:\/|["'])/,
    /from\s+["']@repo\/customization(?:\/|["'])/,
  ];

  for (const filePath of walkTypeScriptFiles(contractsRoot)) {
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

test("components consume customization only through the customization facade", () => {
  for (const filePath of walkTypeScriptFiles(componentsRoot)) {
    const source = readFileSync(filePath, "utf8");

    assert.equal(
      /from\s+["']@repo\/customization(?:\/|["'])/.test(source),
      false,
      `Direct customization import in ${filePath}`
    );
  }
});

test("governance evaluates UI hints only and never claims server-side permission finality", () => {
  const context = createMetadataRenderContext({
    permissions: {},
  });

  const evaluation = evaluateMetadataGovernance({
    context,
    key: "archive",
    policy: {
      fallback: "forbidden",
      permission: "records.archive",
    },
    target: "action",
  });

  assert.equal(evaluation.allowed, false);
  assert.equal(evaluation.decision.effect, "forbidden");
  assert.equal(evaluation.diagnostic?.code, "missing-permission");
  assert.match(
    readFileSync(join(srcRoot, "policy", "governance.ts"), "utf8"),
    /server-side authorization/i
  );
});
