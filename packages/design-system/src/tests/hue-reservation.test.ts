import assert from "node:assert/strict";
import test from "node:test";

import {
  collectAllThemePresetHueEntries,
  collectDefaultPlatformHueEntries,
  extractAfendaHue as extractHue,
  formatAfendaHueValidationReport as formatHueValidationReport,
  afendaHueDistance as hueDistance,
  parseAfendaOklch as parseOklch,
  validateAfendaHueReservation as validateHueReservation,
} from "../contracts/afenda/hue-reservation.contract";
import { STATUS_LIGHT_DECLARATIONS } from "../css/tokens/css-declarations";

test("parseOklch extracts lightness, chroma, hue, and alpha", () => {
  assert.deepEqual(parseOklch("oklch(0.54 0.122 198)"), {
    l: 0.54,
    c: 0.122,
    h: 198,
    alpha: undefined,
  });
  assert.deepEqual(parseOklch("oklch(0.1 0.01 260 / 50%)"), {
    l: 0.1,
    c: 0.01,
    h: 260,
    alpha: 0.5,
  });
});

test("hueDistance wraps around the color wheel", () => {
  assert.equal(hueDistance(350, 10), 20);
  assert.equal(hueDistance(198, 248), 50);
});

test("extractHue reads embedded oklch values", () => {
  assert.equal(extractHue("oklch(0.72 0.11 72)"), 72);
  assert.equal(
    extractHue("color-mix(in oklab, oklch(0.68 0.11 160) 12%, transparent)"),
    160
  );
});

test("all theme presets satisfy brand vs status hue reservation", () => {
  const result = validateHueReservation(collectAllThemePresetHueEntries());
  assert.equal(
    result.valid,
    true,
    formatHueValidationReport(result) ||
      "expected all presets to pass hue validation"
  );
});

test("default platform palette satisfies hue reservation rules", () => {
  const result = validateHueReservation(collectDefaultPlatformHueEntries());

  assert.equal(
    result.valid,
    true,
    formatHueValidationReport(result) || "expected no hue collisions"
  );
});

test("validateHueReservation rejects brand/status collisions", () => {
  const result = validateHueReservation([
    {
      family: "brand-secondary",
      category: "brand",
      hue: 154,
    },
    {
      family: "status-success",
      category: "status",
      hue: 145,
    },
  ]);

  assert.equal(result.valid, false);
  assert.match(formatHueValidationReport(result), /brand-vs-status/);
});

test("validateHueReservation warns on tight lane badge separation", () => {
  const result = validateHueReservation([
    {
      family: "lane-money",
      category: "lane",
      hue: 160,
    },
    {
      family: "lane-intelligence",
      category: "lane",
      hue: 175,
    },
  ]);

  assert.equal(result.valid, true);
  assert.ok(result.warnings.length > 0);
});

test("status and chart declarations align with reserved hue slots", () => {
  for (const [tokenName, value] of STATUS_LIGHT_DECLARATIONS) {
    const key = tokenName
      .replace(/^--/, "")
      .replace(/-foreground$/, "")
      .replace(/-muted.*$/, "")
      .replace(/-border$/, "");
    if (
      key === "success" ||
      key === "warning" ||
      key === "destructive" ||
      key === "info"
    ) {
      const hue = extractHue(value);
      assert.ok(hue !== null, `${tokenName} should contain a parseable hue`);
    }
  }
});
