import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { AvatarOwnerDialog } from "./avatar-owner-dialog";
import { BasicAlertDialog } from "./basic-alert-dialog";
import { ConsentCheckboxDialog } from "./consent-checkbox-dialog";
import { DestructiveConfirmationDialog } from "./destructive-confirmation-dialog";
import { FormEntryDialog } from "./form-entry-dialog";
import { InlineHelpDialog } from "./inline-help-dialog";
import { MediaPreviewDialog } from "./media-preview-dialog";
import { OnboardingDialog } from "./onboarding-dialog";
import { PaymentConfirmationDialog } from "./payment-confirmation-dialog";
import { ScrollableContentDialog } from "./scrollable-content-dialog";
import { SecurityUpdateDialog } from "./security-update-dialog";
import { SessionExpiredDialog } from "./session-expired-dialog";
import { StatusBadgeDialog } from "./status-badge-dialog";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

export const alertDialogPatternCatalog = [
  {
    name: "basic",
    title: "Basic Alert Dialog",
    description: "A standard confirmation dialog for guarded actions.",
    component: BasicAlertDialog,
  },
  {
    name: "destructive-confirmation",
    title: "Destructive Confirmation",
    description: "A destructive-action confirmation with explicit cancel flow.",
    component: DestructiveConfirmationDialog,
  },
  {
    name: "unsaved-changes",
    title: "Unsaved Changes",
    description: "A leave-confirmation dialog for dirty forms.",
    component: UnsavedChangesDialog,
  },
  {
    name: "session-expired",
    title: "Session Expired",
    description: "A stateful dialog for expired authenticated sessions.",
    component: SessionExpiredDialog,
  },
  {
    name: "security-update",
    title: "Security Update",
    description: "A high-priority account or security notice.",
    component: SecurityUpdateDialog,
  },
  {
    name: "payment-confirmation",
    title: "Payment Confirmation",
    description: "A financial confirmation dialog with clear action hierarchy.",
    component: PaymentConfirmationDialog,
  },
  {
    name: "consent-checkbox",
    title: "Consent Checkbox",
    description: "A confirmation dialog requiring explicit consent.",
    component: ConsentCheckboxDialog,
  },
  {
    name: "form-entry",
    title: "Form Entry",
    description: "A compact dialog containing form fields.",
    component: FormEntryDialog,
  },
  {
    name: "scrollable-content",
    title: "Scrollable Content",
    description: "A long-form dialog with scroll-managed content.",
    component: ScrollableContentDialog,
  },
  {
    name: "media-preview",
    title: "Media Preview",
    description: "A confirmation dialog with a media preview region.",
    component: MediaPreviewDialog,
  },
  {
    name: "inline-help",
    title: "Inline Help",
    description: "A dialog for contextual explanation and assistance.",
    component: InlineHelpDialog,
  },
  {
    name: "status-badge",
    title: "Status Badge",
    description: "A dialog that emphasizes current state with a badge.",
    component: StatusBadgeDialog,
  },
  {
    name: "avatar-owner",
    title: "Avatar Owner",
    description: "A dialog for owner or assignee confirmation flows.",
    component: AvatarOwnerDialog,
  },
  {
    name: "onboarding",
    title: "Onboarding",
    description: "A guided dialog for first-run setup flows.",
    component: OnboardingDialog,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type AlertDialogPatternName =
  (typeof alertDialogPatternCatalog)[number]["name"];

export const alertDialogPatternCount = alertDialogPatternCatalog.length;
export const alertDialogPatternNames = alertDialogPatternCatalog.map(
  (pattern) => pattern.name,
) as AlertDialogPatternName[];
