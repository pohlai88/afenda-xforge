/// <reference path="../../types/vendor-contrast.d.ts" />

import { APCAcontrast, sRGBtoY } from "apca-w3";
import { formatRgb, parse } from "culori";

import { AFENDA_APCA_CONTRAST_TARGETS } from "../../contracts/afenda/rules/accessibility.rules";

export { AFENDA_APCA_CONTRAST_TARGETS };

export type ApcaContrastLevel = "AAA" | "AA" | "fail";

function colorToRgbChannels(color: string): readonly [number, number, number] {
  const parsed = parse(color);
  if (!parsed) {
    throw new Error(`Unable to parse color for APCA: ${color}`);
  }

  const rgb = formatRgb(parsed);
  const match = rgb.match(/^rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
  if (!match) {
    throw new Error(`Unable to convert color to RGB for APCA: ${color}`);
  }

  return [
    Number.parseFloat(match[1] ?? "0"),
    Number.parseFloat(match[2] ?? "0"),
    Number.parseFloat(match[3] ?? "0"),
  ] as const;
}

/** Returns absolute APCA lightness contrast (Lc) for text on background. */
export function calcApcaLc(foreground: string, background: string): number {
  const foregroundY = sRGBtoY([...colorToRgbChannels(foreground)]);
  const backgroundY = sRGBtoY([...colorToRgbChannels(background)]);
  return Math.abs(APCAcontrast(foregroundY, backgroundY));
}

export function assessApcaContrastLevel(
  lc: number,
  target: keyof typeof AFENDA_APCA_CONTRAST_TARGETS = "standardUiText",
): ApcaContrastLevel {
  const minimum = AFENDA_APCA_CONTRAST_TARGETS[target];

  if (lc >= AFENDA_APCA_CONTRAST_TARGETS.criticalText) {
    return "AAA";
  }

  if (lc >= minimum) {
    return "AA";
  }

  return "fail";
}

export function formatApcaLc(lc: number): string {
  return `${lc.toFixed(0)} Lc`;
}
