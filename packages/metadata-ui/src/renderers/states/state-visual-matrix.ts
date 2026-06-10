import type { StatePanelTone } from "../../components/state-panel";
import type { MetadataUiState } from "../../contracts/render-context.contract";

export type StateVisualIcon =
  | "alert-circle"
  | "alert-triangle"
  | "eye"
  | "file-warning"
  | "inbox"
  | "loader"
  | "lock"
  | "wrench";

export type StateVisualDefinition = {
  actionLabel?: string;
  defaultDescription: string;
  defaultTitle: string;
  icon: StateVisualIcon;
  primaryElement: "alert" | "banner" | "content" | "panel" | "skeleton";
  tone: StatePanelTone;
  userAction: string;
};

export const STATE_VISUAL_MATRIX: Record<
  MetadataUiState,
  StateVisualDefinition
> = {
  loading: {
    defaultDescription: "Fetching metadata-driven content. Please wait.",
    defaultTitle: "Loading…",
    icon: "loader",
    primaryElement: "skeleton",
    tone: "info",
    userAction: "wait",
  },
  empty: {
    actionLabel: "Create record",
    defaultDescription:
      "Nothing matches your filters yet. Add a record to get started.",
    defaultTitle: "No records available",
    icon: "inbox",
    primaryElement: "panel",
    tone: "muted",
    userAction: "optional-cta",
  },
  error: {
    actionLabel: "Retry",
    defaultDescription:
      "The metadata surface could not be rendered. Try again or contact support.",
    defaultTitle: "Unable to load records",
    icon: "alert-circle",
    primaryElement: "panel",
    tone: "danger",
    userAction: "retry",
  },
  forbidden: {
    actionLabel: "Go back",
    defaultDescription:
      "You do not have permission to view this surface. Contact an administrator if you need access.",
    defaultTitle: "Access restricted",
    icon: "lock",
    primaryElement: "panel",
    tone: "warning",
    userAction: "go-back",
  },
  ready: {
    defaultDescription: "",
    defaultTitle: "",
    icon: "eye",
    primaryElement: "content",
    tone: "neutral",
    userAction: "interact",
  },
  invalid: {
    actionLabel: "Review metadata",
    defaultDescription:
      "The metadata contract failed validation. Fix the contract or report the issue.",
    defaultTitle: "Invalid metadata surface",
    icon: "file-warning",
    primaryElement: "alert",
    tone: "danger",
    userAction: "fix-or-report",
  },
  degraded: {
    actionLabel: "Continue with caution",
    defaultDescription:
      "Some metadata capabilities are unavailable. You can continue, but results may be incomplete.",
    defaultTitle: "Degraded mode",
    icon: "alert-triangle",
    primaryElement: "banner",
    tone: "warning",
    userAction: "continue",
  },
  partial: {
    actionLabel: "Refresh",
    defaultDescription:
      "Some sections failed to load. Refresh to retry the missing areas.",
    defaultTitle: "Partial content available",
    icon: "alert-triangle",
    primaryElement: "banner",
    tone: "warning",
    userAction: "refresh",
  },
  readonly: {
    defaultDescription:
      "This surface is view-only. Editing and actions are disabled.",
    defaultTitle: "View-only mode",
    icon: "eye",
    primaryElement: "banner",
    tone: "muted",
    userAction: "none",
  },
  maintenance: {
    actionLabel: "Return later",
    defaultDescription:
      "This metadata surface is temporarily unavailable while maintenance is in progress.",
    defaultTitle: "Maintenance in progress",
    icon: "wrench",
    primaryElement: "banner",
    tone: "info",
    userAction: "wait",
  },
};

export function resolveStateVisualDefinition(
  state: MetadataUiState
): StateVisualDefinition {
  return STATE_VISUAL_MATRIX[state];
}
