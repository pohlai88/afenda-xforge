import type * as React from "react";

import { AlertWithActionButtons } from "./alert-with-action-buttons";
import { AlertWithDescriptionAndActionButtons } from "./alert-with-description-and-action-buttons";
import { AlertWithExtendedMessage } from "./alert-with-extended-message";
import { AlertWithIcon } from "./alert-with-icon";
import { AlertWithTitleAndActionButtons } from "./alert-with-title-and-action-buttons";
import { AlertWithTitleDescription } from "./alert-with-title-description";
import { AvatarAlert } from "./avatar-alert";
import { BulletListAlert } from "./bullet-list-alert";
import { DestructiveAlert } from "./destructive-alert";
import { DismissibleAlert } from "./dismissible-alert";
import { InfoAlert } from "./info-alert";
import { InlineAlert } from "./inline-alert";
import { InvertAlert } from "./invert-alert";
import { LinkAlert } from "./link-alert";
import { NotificationAlert } from "./notification-alert";
import { PaymentFailedAlert } from "./payment-failed-alert";
import { SecurityUpdateAlert } from "./security-update-alert";
import { StatusBadgeAlert } from "./status-badge-alert";
import { SuccessAlert } from "./success-alert";
import { WarningAlert } from "./warning-alert";

export type AlertPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const alertPatternCatalog = [
  {
    name: "title-description",
    title: "Alert with title and description",
    description: "A simple alert with a title and supporting text.",
    component: AlertWithTitleDescription,
  },
  {
    name: "icon",
    title: "Alert with icon",
    description: "Adds a leading icon to strengthen the status signal.",
    component: AlertWithIcon,
  },
  {
    name: "action-buttons",
    title: "Alert with action buttons",
    description: "Uses inline actions to resolve or dismiss the message.",
    component: AlertWithActionButtons,
  },
  {
    name: "extended-message",
    title: "Alert with extended message",
    description: "Shows a longer description for richer context.",
    component: AlertWithExtendedMessage,
  },
  {
    name: "title-action-buttons",
    title: "Alert with title and action buttons",
    description: "Pairs a concise title with call-to-action buttons.",
    component: AlertWithTitleAndActionButtons,
  },
  {
    name: "description-action-buttons",
    title: "Alert with description and action buttons",
    description: "Places the description beside an action cluster.",
    component: AlertWithDescriptionAndActionButtons,
  },
  {
    name: "info",
    title: "Info alert",
    description: "A neutral informational state.",
    component: InfoAlert,
  },
  {
    name: "success",
    title: "Success alert",
    description: "A positive state for completed work or confirmations.",
    component: SuccessAlert,
  },
  {
    name: "warning",
    title: "Warning alert",
    description: "Highlights a cautionary state that needs attention.",
    component: WarningAlert,
  },
  {
    name: "destructive",
    title: "Destructive alert",
    description: "Signals a high-risk or irreversible action.",
    component: DestructiveAlert,
  },
  {
    name: "invert",
    title: "Invert alert",
    description: "A strong inverse treatment for dark emphasis.",
    component: InvertAlert,
  },
  {
    name: "security-update",
    title: "Security update alert",
    description: "Communicates an important security-related update.",
    component: SecurityUpdateAlert,
  },
  {
    name: "payment-failed",
    title: "Payment failed alert",
    description: "Shows a failure state for payment or billing flows.",
    component: PaymentFailedAlert,
  },
  {
    name: "inline",
    title: "Inline alert",
    description: "Fits into dense layouts without a large block footprint.",
    component: InlineAlert,
  },
  {
    name: "dismissible",
    title: "Dismissible alert",
    description: "Includes a close action for transient messages.",
    component: DismissibleAlert,
  },
  {
    name: "bullet-list",
    title: "Bullet list alert",
    description: "Uses bullets to break a longer message into steps.",
    component: BulletListAlert,
  },
  {
    name: "link",
    title: "Link alert",
    description: "Prompts the user toward a linked action or destination.",
    component: LinkAlert,
  },
  {
    name: "avatar",
    title: "Avatar alert",
    description: "Uses an avatar to anchor the alert to a person or actor.",
    component: AvatarAlert,
  },
  {
    name: "notification",
    title: "Notification alert",
    description: "A compact notification-style callout.",
    component: NotificationAlert,
  },
  {
    name: "status-badge",
    title: "Status badge alert",
    description: "Pairs status badges with alert content.",
    component: StatusBadgeAlert,
  },
] as const satisfies readonly AlertPatternSpec[];

export type AlertPatternName = (typeof alertPatternCatalog)[number]["name"];

export const alertPatternCount = alertPatternCatalog.length;
export const alertPatternNames = alertPatternCatalog.map(
  (pattern) => pattern.name,
) as AlertPatternName[];
