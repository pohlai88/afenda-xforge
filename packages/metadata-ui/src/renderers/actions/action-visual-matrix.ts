import type { MetadataActionSurface } from "../../contracts/action-renderer.contract";

export type ActionVisualDefinition = {
  ariaHasPopup?: "menu";
  buttonVariant: "default" | "destructive" | "ghost";
  requiresConfirmation: boolean;
  surface: MetadataActionSurface;
};

export const ACTION_VISUAL_MATRIX: Record<
  MetadataActionSurface,
  ActionVisualDefinition
> = {
  button: {
    buttonVariant: "default",
    requiresConfirmation: false,
    surface: "button",
  },
  destructive: {
    buttonVariant: "destructive",
    requiresConfirmation: true,
    surface: "destructive",
  },
  menu: {
    ariaHasPopup: "menu",
    buttonVariant: "ghost",
    requiresConfirmation: false,
    surface: "menu",
  },
};

export function resolveActionVisualDefinition(
  surface: MetadataActionSurface
): ActionVisualDefinition {
  return ACTION_VISUAL_MATRIX[surface];
}
