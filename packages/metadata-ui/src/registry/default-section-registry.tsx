import type {
  MetadataSectionKind,
  MetadataSectionRenderer as MetadataSectionRendererContract,
} from "../contracts/section-renderer.contract";
import { generatedSectionRendererRegistrations } from "../generated/section-renderer-registry.generated";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultSectionRegistry = createRendererRegistry<
  MetadataSectionKind,
  MetadataSectionRendererContract
>(generatedSectionRendererRegistrations);
