import type {
  MetadataLayoutKind,
  MetadataLayoutRenderer,
} from "../contracts/layout.contract";
import { MetadataStackLayoutRenderer } from "../renderers/layouts/metadata-stack-layout.renderer";
import { createRendererRegistry } from "./create-renderer-registry.ts";

const layoutRenderers: Partial<
  Record<MetadataLayoutKind, MetadataLayoutRenderer>
> = {
  dashboard: MetadataStackLayoutRenderer,
  grid: MetadataStackLayoutRenderer,
  panel: MetadataStackLayoutRenderer,
  stack: MetadataStackLayoutRenderer,
  tabs: MetadataStackLayoutRenderer,
  wizard: MetadataStackLayoutRenderer,
};

export const defaultLayoutRegistry = createRendererRegistry<
  MetadataLayoutKind,
  MetadataLayoutRenderer
>(
  Object.entries(layoutRenderers).map(([key, renderer]) => ({
    key,
    renderer: renderer as MetadataLayoutRenderer,
    version: "1.0.0",
  }))
);
