import type { MetadataSectionKind } from "../contracts/section-renderer.contract";
import { MetadataCardSectionRenderer } from "../renderers/sections/metadata-card-section.renderer";
import { MetadataFormSectionRenderer } from "../renderers/sections/metadata-form-section.renderer";
import { MetadataSectionRenderer } from "../renderers/sections/metadata-section.renderer";
import { MetadataTableSectionRenderer } from "../renderers/sections/metadata-table-section.renderer";
import { createRendererRegistry } from "./create-renderer-registry";

export const defaultSectionRegistry = createRendererRegistry<
  MetadataSectionKind,
  typeof MetadataSectionRenderer
>([
  ["card", MetadataCardSectionRenderer],
  ["form", MetadataFormSectionRenderer],
  ["section", MetadataSectionRenderer],
  ["table", MetadataTableSectionRenderer],
]);
