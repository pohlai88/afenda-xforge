import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { CheckboxAvatarCard } from "./checkbox-avatar-card";
import { CheckboxBasicWithLabel } from "./checkbox-basic-with-label";
import { CheckboxCardGroup } from "./checkbox-card-group";
import { CheckboxCardGroupWithIcons } from "./checkbox-card-group-with-icons";
import { CheckboxCircle } from "./checkbox-circle";
import { CheckboxColored } from "./checkbox-colored";
import { CheckboxDisabled } from "./checkbox-disabled";
import { CheckboxGroup } from "./checkbox-group";
import { CheckboxGroupInAFrame } from "./checkbox-group-in-a-frame";
import { CheckboxGroupWithBadge } from "./checkbox-group-with-badge";
import { CheckboxIndeterminate } from "./checkbox-indeterminate";
import { CheckboxInlineHorizontalGroup } from "./checkbox-inline-horizontal-group";
import { CheckboxInvalid } from "./checkbox-invalid";
import { CheckboxNestedGroup } from "./checkbox-nested-group";
import { CheckboxPaymentMethodCard } from "./checkbox-payment-method-card";
import { CheckboxWithLabelAndDescription } from "./checkbox-with-label-and-description";
import { CheckboxWithTooltipInfo } from "./checkbox-with-tooltip-info";

export const checkboxPatternCatalog = [
  {
    name: "basic-label",
    title: "Basic With Label",
    description: "A checkbox with a directly associated label.",
    component: CheckboxBasicWithLabel,
  },
  {
    name: "label-description",
    title: "Label And Description",
    description: "A checkbox field with supporting description text.",
    component: CheckboxWithLabelAndDescription,
  },
  {
    name: "group",
    title: "Group",
    description: "A grouped checkbox collection for multi-select fields.",
    component: CheckboxGroup,
  },
  {
    name: "group-in-frame",
    title: "Group In Frame",
    description: "A grouped checkbox collection inside a framed region.",
    component: CheckboxGroupInAFrame,
  },
  {
    name: "inline-group",
    title: "Inline Horizontal Group",
    description: "A compact horizontal checkbox group.",
    component: CheckboxInlineHorizontalGroup,
  },
  {
    name: "nested-group",
    title: "Nested Group",
    description: "A checkbox tree for nested option sets.",
    component: CheckboxNestedGroup,
  },
  {
    name: "card-group",
    title: "Card Group",
    description: "A selectable-card checkbox group.",
    component: CheckboxCardGroup,
  },
  {
    name: "card-group-icons",
    title: "Card Group With Icons",
    description: "A selectable-card group with visual option icons.",
    component: CheckboxCardGroupWithIcons,
  },
  {
    name: "avatar-card",
    title: "Avatar Card",
    description: "A selectable person or owner card.",
    component: CheckboxAvatarCard,
  },
  {
    name: "payment-method-card",
    title: "Payment Method Card",
    description: "A selectable payment option card.",
    component: CheckboxPaymentMethodCard,
  },
  {
    name: "indeterminate",
    title: "Indeterminate",
    description: "A checkbox preset for partial selection state.",
    component: CheckboxIndeterminate,
  },
  {
    name: "invalid",
    title: "Invalid",
    description: "A checkbox field with validation treatment.",
    component: CheckboxInvalid,
  },
  {
    name: "disabled",
    title: "Disabled",
    description: "A disabled checkbox state preset.",
    component: CheckboxDisabled,
  },
  {
    name: "colored",
    title: "Colored",
    description: "A checkbox treatment with semantic color emphasis.",
    component: CheckboxColored,
  },
  {
    name: "circle",
    title: "Circle",
    description: "A rounded checkbox visual treatment.",
    component: CheckboxCircle,
  },
  {
    name: "tooltip-info",
    title: "Tooltip Info",
    description: "A checkbox with contextual tooltip assistance.",
    component: CheckboxWithTooltipInfo,
  },
  {
    name: "group-badge",
    title: "Group With Badge",
    description: "A checkbox group with badge metadata.",
    component: CheckboxGroupWithBadge,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type CheckboxPatternName =
  (typeof checkboxPatternCatalog)[number]["name"];

export const checkboxPatternCount = checkboxPatternCatalog.length;
export const checkboxPatternNames = checkboxPatternCatalog.map(
  (pattern) => pattern.name,
) as CheckboxPatternName[];
