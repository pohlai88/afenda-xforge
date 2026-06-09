import type {
  MetadataActionRenderer,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import { generatedActionRendererRegistrations } from "../generated/action-renderer-registry.generated";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultActionRegistry = createRendererRegistry<
  MetadataActionSurface,
  MetadataActionRenderer
>(generatedActionRendererRegistrations);
