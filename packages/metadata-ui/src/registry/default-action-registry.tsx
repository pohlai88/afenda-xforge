import type { MetadataActionKind } from "../contracts/action-renderer.contract";
import { ButtonActionRenderer } from "../renderers/actions/button-action.renderer";
import { DestructiveActionRenderer } from "../renderers/actions/destructive-action.renderer";
import { MenuActionRenderer } from "../renderers/actions/menu-action.renderer";
import { createRendererRegistry } from "./create-renderer-registry";

export const defaultActionRegistry = createRendererRegistry<
  MetadataActionKind,
  typeof ButtonActionRenderer
>([
  ["button", ButtonActionRenderer],
  ["destructive", DestructiveActionRenderer],
  ["menu", MenuActionRenderer],
]);
