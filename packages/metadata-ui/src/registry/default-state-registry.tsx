import type {
  MetadataStateKind,
  MetadataStateRenderer,
} from "../contracts/state-renderer.contract";
import { generatedStateRendererRegistrations } from "../generated/state-renderer-registry.generated";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultStateRegistry = createRendererRegistry<
  MetadataStateKind,
  MetadataStateRenderer
>(generatedStateRendererRegistrations);
