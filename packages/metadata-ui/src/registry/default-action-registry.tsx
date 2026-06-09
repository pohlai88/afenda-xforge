import type {
  MetadataActionRenderer,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import { ButtonActionRenderer } from "../renderers/actions/button-action.renderer";
import { DestructiveActionRenderer } from "../renderers/actions/destructive-action.renderer";
import { MenuActionRenderer } from "../renderers/actions/menu-action.renderer";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultActionRegistry = createRendererRegistry<
  MetadataActionSurface,
  MetadataActionRenderer
>([
  {
    key: "button",
    renderer: ButtonActionRenderer,
    version: "1.0.0",
  },
  {
    key: "destructive",
    renderer: DestructiveActionRenderer,
    version: "1.0.0",
  },
  {
    key: "menu",
    renderer: MenuActionRenderer,
    version: "1.0.0",
  },
]);
