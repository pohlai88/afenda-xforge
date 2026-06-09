import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { AspectRatioClassicPhotography } from "./aspect-ratio-classic-photography";
import { AspectRatioMonitor } from "./aspect-ratio-monitor";
import { AspectRatioPortrait } from "./aspect-ratio-portrait";
import { AspectRatioSocialPortrait } from "./aspect-ratio-social-portrait";
import { AspectRatioSquare } from "./aspect-ratio-square";
import { AspectRatioStandard } from "./aspect-ratio-standard";
import { AspectRatioUltrawide } from "./aspect-ratio-ultrawide";
import { AspectRatioWidescreen } from "./aspect-ratio-widescreen";

export const aspectRatioPatternCatalog = [
  {
    name: "square",
    title: "Square",
    description: "A 1:1 frame for avatars, thumbnails, and tiles.",
    component: AspectRatioSquare,
  },
  {
    name: "standard",
    title: "Standard",
    description: "A 4:3 frame for traditional media and document previews.",
    component: AspectRatioStandard,
  },
  {
    name: "widescreen",
    title: "Widescreen",
    description: "A 16:9 frame for video and wide preview surfaces.",
    component: AspectRatioWidescreen,
  },
  {
    name: "ultrawide",
    title: "Ultrawide",
    description: "An extra-wide frame for banners and panoramic media.",
    component: AspectRatioUltrawide,
  },
  {
    name: "portrait",
    title: "Portrait",
    description: "A vertical frame for mobile and portrait media.",
    component: AspectRatioPortrait,
  },
  {
    name: "social-portrait",
    title: "Social Portrait",
    description: "A tall social-media frame for story-like content.",
    component: AspectRatioSocialPortrait,
  },
  {
    name: "monitor",
    title: "Monitor",
    description: "A screen-shaped frame for product or dashboard previews.",
    component: AspectRatioMonitor,
  },
  {
    name: "classic-photography",
    title: "Classic Photography",
    description: "A photography-oriented frame for visual assets.",
    component: AspectRatioClassicPhotography,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type AspectRatioPatternName =
  (typeof aspectRatioPatternCatalog)[number]["name"];

export const aspectRatioPatternCount = aspectRatioPatternCatalog.length;
export const aspectRatioPatternNames = aspectRatioPatternCatalog.map(
  (pattern) => pattern.name,
) as AspectRatioPatternName[];
