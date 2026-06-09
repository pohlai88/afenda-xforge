"use client";

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

export function AlertDialogComposeGallery() {
  return (
    <div className="grid gap-6">
      <BasicAlertDialog />
      <DestructiveConfirmationDialog />
      <UnsavedChangesDialog />
      <SecurityUpdateDialog />
      <SessionExpiredDialog />
      <PaymentConfirmationDialog />
      <MediaPreviewDialog />
      <AvatarOwnerDialog />
      <FormEntryDialog />
      <ConsentCheckboxDialog />
      <ScrollableContentDialog />
      <StatusBadgeDialog />
      <InlineHelpDialog />
      <OnboardingDialog />
    </div>
  );
}
