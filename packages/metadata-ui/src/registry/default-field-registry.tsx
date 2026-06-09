import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../contracts/field-renderer.contract";
import { generatedFieldRendererRegistrations } from "../generated/field-renderer-registry.generated";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultFieldRegistry = createRendererRegistry<
  MetadataFieldKind,
  MetadataFieldRenderer
>(generatedFieldRendererRegistrations);
