import type {
  MetadataSectionKind,
  MetadataSectionRenderer as MetadataSectionRendererContract,
} from "../contracts/section-renderer.contract";
import { MetadataCardSectionRenderer } from "../renderers/sections/metadata-card-section.renderer";
import { MetadataFormSectionRenderer } from "../renderers/sections/metadata-form-section.renderer";
import { MetadataSectionRenderer } from "../renderers/sections/metadata-section.renderer";
import { MetadataTableSectionRenderer } from "../renderers/sections/metadata-table-section.renderer";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultSectionRegistry = createRendererRegistry<
  MetadataSectionKind,
  MetadataSectionRendererContract
>([
  {
    key: "activity",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
  {
    key: "approval",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
  { key: "card", renderer: MetadataCardSectionRenderer, version: "1.0.0" },
  { key: "chart", renderer: MetadataCardSectionRenderer, version: "1.0.0" },
  {
    key: "dashboard",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
  {
    key: "details",
    renderer: MetadataCardSectionRenderer,
    version: "1.0.0",
  },
  {
    key: "evidence",
    renderer: MetadataCardSectionRenderer,
    version: "1.0.0",
  },
  { key: "form", renderer: MetadataFormSectionRenderer, version: "1.0.0" },
  {
    key: "kanban",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
  { key: "list", renderer: MetadataTableSectionRenderer, version: "1.0.0" },
  {
    key: "section",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
  { key: "stat", renderer: MetadataCardSectionRenderer, version: "1.0.0" },
  { key: "table", renderer: MetadataTableSectionRenderer, version: "1.0.0" },
  {
    key: "timeline",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
  {
    key: "workflow",
    renderer: MetadataSectionRenderer,
    version: "1.0.0",
  },
]);
