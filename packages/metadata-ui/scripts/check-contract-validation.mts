import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const contractValidationPath = join(
  packageRoot,
  "src",
  "adapters",
  "contract-validation.ts"
);
const contractValidationTestPath = join(
  packageRoot,
  "tests",
  "contract-validation.test.ts"
);

export function checkContractValidation(): void {
  const violations: string[] = [];
  const validationSource = readFileSync(contractValidationPath, "utf8");
  const validationTestSource = readFileSync(contractValidationTestPath, "utf8");

  const requiredValidationSymbols = [
    "metadataFieldKinds",
    "metadataSectionKinds",
    "validateMetadataFieldContract",
    "validateMetadataActionContract",
    "validateMetadataSectionContract",
    "supportedFieldKinds",
    "supportedActionKinds",
    "supportedSectionKinds",
  ] as const;

  for (const symbol of requiredValidationSymbols) {
    if (!validationSource.includes(symbol)) {
      violations.push(
        `${relative(packageRoot, contractValidationPath)}: missing validation symbol ${symbol} (MUI-014)`
      );
    }
  }

  const requiredValidationCases = [
    "unsupported kind",
    "requires at least one option",
    "requires a non-empty kind",
    "confirmationPolicy requires a non-empty message",
    "row at index",
  ] as const;

  for (const testCase of requiredValidationCases) {
    if (!validationTestSource.includes(testCase)) {
      violations.push(
        `${relative(packageRoot, contractValidationTestPath)}: missing validation case '${testCase}' (MUI-014)`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-014 contract validation lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkContractValidation();
  console.log("MUI-014 contract validation lint passed.");
}
