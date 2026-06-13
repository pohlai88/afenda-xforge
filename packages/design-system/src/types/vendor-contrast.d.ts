declare module "apca-w3" {
  export function APCAcontrast(textY: number, bgY: number): number;
  export function sRGBtoY(rgb: readonly [number, number, number]): number;
  export function calcAPCA(
    textColor: string | number[],
    bgColor: string | number[],
  ): number;
  export function reverseAPCA(
    contrast: number,
    knownY?: number,
    knownType?: "bg" | "fg",
    returnAs?: string,
  ): string | false;
}

declare module "culori" {
  export function parse(color: string): unknown;
  export function formatRgb(color: unknown): string;
  export function wcagContrast(
    foreground: unknown,
    background: unknown,
  ): number;
}
