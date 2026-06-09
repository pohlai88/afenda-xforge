import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { BreadcrumbBasic } from "./breadcrumb-basic";
import { BreadcrumbButtonStyle } from "./breadcrumb-button-style";
import { BreadcrumbInsideCard } from "./breadcrumb-inside-card";
import { BreadcrumbPillStyleInsideFrame } from "./breadcrumb-pill-style-inside-frame";
import { BreadcrumbProjectUserDocumentInfo } from "./breadcrumb-project-user-document-info";
import { BreadcrumbWithAvatars } from "./breadcrumb-with-avatars";
import { BreadcrumbWithBadgeCount } from "./breadcrumb-with-badge-count";
import { BreadcrumbWithCustomSeparator } from "./breadcrumb-with-custom-separator";
import { BreadcrumbWithCustomSlashSeparator } from "./breadcrumb-with-custom-slash-separator";
import { BreadcrumbWithDoubleChevronSeparators } from "./breadcrumb-with-double-chevron-separators";
import { BreadcrumbWithDropdownMenu } from "./breadcrumb-with-dropdown-menu";
import { BreadcrumbWithEllipsisForLongPaths } from "./breadcrumb-with-ellipsis-for-long-paths";
import { BreadcrumbWithHomeIcon } from "./breadcrumb-with-home-icon";
import { BreadcrumbWithIcons } from "./breadcrumb-with-icons";
import { BreadcrumbWithNextLink } from "./breadcrumb-with-next-link";

export const breadcrumbPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A standard breadcrumb trail for page hierarchy.",
    component: BreadcrumbBasic,
  },
  {
    name: "home-icon",
    title: "Home Icon",
    description: "A breadcrumb trail with a home affordance.",
    component: BreadcrumbWithHomeIcon,
  },
  {
    name: "icons",
    title: "Icons",
    description: "A breadcrumb trail with visual type cues.",
    component: BreadcrumbWithIcons,
  },
  {
    name: "ellipsis-long-paths",
    title: "Ellipsis For Long Paths",
    description: "A breadcrumb trail that compresses deep hierarchy.",
    component: BreadcrumbWithEllipsisForLongPaths,
  },
  {
    name: "dropdown-menu",
    title: "Dropdown Menu",
    description: "A breadcrumb trail with collapsed path selection.",
    component: BreadcrumbWithDropdownMenu,
  },
  {
    name: "badge-count",
    title: "Badge Count",
    description: "A breadcrumb trail with count metadata.",
    component: BreadcrumbWithBadgeCount,
  },
  {
    name: "avatars",
    title: "Avatars",
    description: "A breadcrumb trail with people or ownership context.",
    component: BreadcrumbWithAvatars,
  },
  {
    name: "project-user-document",
    title: "Project User Document",
    description: "A rich breadcrumb for entity detail pages.",
    component: BreadcrumbProjectUserDocumentInfo,
  },
  {
    name: "inside-card",
    title: "Inside Card",
    description: "A breadcrumb treatment for card-framed content.",
    component: BreadcrumbInsideCard,
  },
  {
    name: "pill-frame",
    title: "Pill Frame",
    description: "A pill-style breadcrumb for compact surfaces.",
    component: BreadcrumbPillStyleInsideFrame,
  },
  {
    name: "button-style",
    title: "Button Style",
    description: "A breadcrumb pattern using button-like items.",
    component: BreadcrumbButtonStyle,
  },
  {
    name: "custom-separator",
    title: "Custom Separator",
    description: "A breadcrumb trail with a custom separator.",
    component: BreadcrumbWithCustomSeparator,
  },
  {
    name: "slash-separator",
    title: "Slash Separator",
    description: "A breadcrumb trail using slash separators.",
    component: BreadcrumbWithCustomSlashSeparator,
  },
  {
    name: "double-chevron",
    title: "Double Chevron",
    description: "A breadcrumb trail using double-chevron separators.",
    component: BreadcrumbWithDoubleChevronSeparators,
  },
  {
    name: "next-link",
    title: "Next Link",
    description: "A breadcrumb pattern compatible with Next link usage.",
    component: BreadcrumbWithNextLink,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type BreadcrumbPatternName =
  (typeof breadcrumbPatternCatalog)[number]["name"];

export const breadcrumbPatternCount = breadcrumbPatternCatalog.length;
export const breadcrumbPatternNames = breadcrumbPatternCatalog.map(
  (pattern) => pattern.name,
) as BreadcrumbPatternName[];
