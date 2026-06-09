import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { CardAdvancedCleanLoginForm } from "./card-advanced-clean-login-form";
import { CardBasic } from "./card-basic";
import { CardDeploymentStatusSummary } from "./card-deployment-status-summary";
import { CardExpandableBillingUsage } from "./card-expandable-billing-usage";
import { CardHeaderWithBorder } from "./card-header-with-border";
import { CardStatWithTrendAndOverflowMenu } from "./card-stat-with-trend-and-overflow-menu";
import { CardWithBorderSeparation } from "./card-with-border-separation";
import { CardWithDropdownMenu } from "./card-with-dropdown-menu";
import { CardWithHeaderAndFooter } from "./card-with-header-and-footer";
import { CardWithHeaderBadgeAndActions } from "./card-with-header-badge-and-actions";
import { CardWithHeaderLabelAndLink } from "./card-with-header-label-and-link";
import { CardWithIconTitleAndLink } from "./card-with-icon-title-and-link";
import { CardWithImage } from "./card-with-image";
import { CardWithLink } from "./card-with-link";

export const cardPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A neutral content card for metadata sections.",
    component: CardBasic,
  },
  {
    name: "header-footer",
    title: "Header And Footer",
    description: "A section card with explicit header, body, and footer.",
    component: CardWithHeaderAndFooter,
  },
  {
    name: "header-badge-actions",
    title: "Header Badge Actions",
    description: "A card header with state and action affordances.",
    component: CardWithHeaderBadgeAndActions,
  },
  {
    name: "header-label-link",
    title: "Header Label Link",
    description: "A compact card with label and navigational action.",
    component: CardWithHeaderLabelAndLink,
  },
  {
    name: "icon-title-link",
    title: "Icon Title Link",
    description: "A card for linked feature or entity summaries.",
    component: CardWithIconTitleAndLink,
  },
  {
    name: "with-link",
    title: "With Link",
    description: "A card with a primary navigation affordance.",
    component: CardWithLink,
  },
  {
    name: "with-image",
    title: "With Image",
    description: "A media-backed card for visual records.",
    component: CardWithImage,
  },
  {
    name: "border-separation",
    title: "Border Separation",
    description: "A card with clear internal content divisions.",
    component: CardWithBorderSeparation,
  },
  {
    name: "header-border",
    title: "Header Border",
    description: "A structured card with a separated header.",
    component: CardHeaderWithBorder,
  },
  {
    name: "dropdown-menu",
    title: "Dropdown Menu",
    description: "A card with contextual overflow actions.",
    component: CardWithDropdownMenu,
  },
  {
    name: "stat-trend-overflow",
    title: "Stat Trend Overflow",
    description: "A metric card with trend and overflow controls.",
    component: CardStatWithTrendAndOverflowMenu,
  },
  {
    name: "deployment-status",
    title: "Deployment Status",
    description: "A status summary card for operational records.",
    component: CardDeploymentStatusSummary,
  },
  {
    name: "billing-usage",
    title: "Billing Usage",
    description: "An expandable usage and billing summary card.",
    component: CardExpandableBillingUsage,
  },
  {
    name: "login-form",
    title: "Login Form",
    description: "A form card for authentication-like entry flows.",
    component: CardAdvancedCleanLoginForm,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type CardPatternName = (typeof cardPatternCatalog)[number]["name"];

export const cardPatternCount = cardPatternCatalog.length;
export const cardPatternNames = cardPatternCatalog.map(
  (pattern) => pattern.name,
) as CardPatternName[];
