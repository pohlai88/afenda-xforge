import {
  formatAfendaHueValidationReport as formatHueValidationReport,
  validateAfendaHueReservation as validateHueReservation,
} from "../src/contracts/afenda/hue-reservation.contract.ts";
import {
  collectAllThemePresetHueEntries,
  collectDefaultPlatformHueEntries,
} from "../src/contracts/afenda/hue-reservation.contract.ts";

const platformResult = validateHueReservation(
  collectDefaultPlatformHueEntries()
);
const presetResult = validateHueReservation(collectAllThemePresetHueEntries());

const failures = [
  ...(platformResult.valid ? [] : [formatHueValidationReport(platformResult)]),
  ...(presetResult.valid ? [] : [formatHueValidationReport(presetResult)]),
].filter(Boolean);

if (failures.length > 0) {
  console.error("Hue reservation check failed:\n");
  console.error(failures.join("\n\n"));
  process.exit(1);
}

for (const result of [platformResult, presetResult]) {
  if (result.warnings.length > 0) {
    console.warn(formatHueValidationReport(result));
  }
}

console.log("Hue reservation check passed.");
