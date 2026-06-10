/**
 * Layout composition rules for metadata-driven surfaces (MUI-VIS-013).
 * Radial, orbital, and stacked layouts must use deterministic sizing and
 * pin-based positioning — never inline transform + hover transform on one node.
 */
export const LAYOUT_COMPOSITION_RULES = [
  "Compute stage size from content radius + node dimensions + padding.",
  "Position orbital nodes with outer pin (left/top) and inner centering (-translate-x/y-1/2).",
  "Never combine inline style.transform with Tailwind hover translate on the same element.",
  "Keep footers and stats outside the orbital stage — not absolutely positioned over nodes.",
  "Use semantic tokens and @utility classes for background-size; avoid ad-hoc bg-size-[…] utilities.",
  "Import shared layout math from @repo/metadata-ui/visualization/orbit-layout when using radial UI.",
] as const;

export type LayoutCompositionRule = (typeof LAYOUT_COMPOSITION_RULES)[number];
