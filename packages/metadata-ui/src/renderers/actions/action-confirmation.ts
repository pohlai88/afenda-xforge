import type {
  MetadataActionContract,
  MetadataActionSurface,
} from "../../contracts/action-renderer.contract";
import { resolveActionVisualDefinition } from "./action-visual-matrix";

export type ActionConfirmationCopy = {
  cancelLabel: string;
  confirmLabel: string;
  message: string;
  title: string;
};

export function requiresActionConfirmation(
  action: MetadataActionContract,
  surface: MetadataActionSurface
): boolean {
  const visual = resolveActionVisualDefinition(surface);

  return (
    visual.requiresConfirmation ||
    action.dangerous === true ||
    action.confirmationPolicy?.required === true ||
    Boolean(action.confirmationPolicy?.message) ||
    Boolean(action.confirmMessage)
  );
}

export function resolveActionConfirmationCopy(
  action: MetadataActionContract,
  surface: MetadataActionSurface
): ActionConfirmationCopy {
  const message =
    action.confirmationPolicy?.message ??
    action.confirmMessage ??
    (surface === "destructive"
      ? `${action.label} cannot be undone. Review the impact before continuing.`
      : "Are you sure you want to continue?");

  return {
    cancelLabel: "Cancel",
    confirmLabel: action.label,
    message,
    title: action.confirmationPolicy?.title ?? `Confirm ${action.label}`,
  };
}
