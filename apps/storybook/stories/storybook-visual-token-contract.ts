/**
 * Storybook story and helper surfaces shall use semantic design tokens (MUI-VIS-015).
 * Structural orbit rules remain in check-intro-layout.mts (MUI-VIS-013).
 */
export const STORYBOOK_VISUAL_TOKEN_RULES = [
  "Use semantic Tailwind tokens — no raw palette utilities in stories.",
  "Register unreliable Tailwind arbitrary utilities as @utility in preview.css.",
  "Orbit stages must use MetadataOrbitStage and overflow-visible stage roots.",
  "Do not import lucide-react unless it is declared in storybook dependencies.",
] as const;

export type StorybookVisualTokenRule =
  (typeof STORYBOOK_VISUAL_TOKEN_RULES)[number];
