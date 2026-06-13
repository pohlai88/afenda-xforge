import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const INTERACTION = "interaction" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_INTERACTION_RULES = [
  {
    id: "interaction.visible-states",
    category: INTERACTION,
    severity: WARNING,
    appliesTo: ["button", "link", "interactive-element"],
    rationale:
      "Visible interaction states help users understand affordance and current state.",
    requirement: "Hover, active, and focus states must be visually distinct.",
    remediation: "Increase contrast or emphasis for hover, active, and focus states.",
    references: ["WCAG:1.4.11"],
    enforcement: MANUAL,
  },
  {
    id: "interaction.hover-feedback",
    category: INTERACTION,
    severity: WARNING,
    appliesTo: ["button", "link", "menu-item", "row-action", "interactive-element"],
    rationale:
      "Hover feedback confirms that an element is interactive before activation.",
    requirement: "Buttons, links, and interactive rows must provide hover feedback.",
    remediation: "Add a hover state that changes contrast, surface, underline, or affordance.",
    references: ["WCAG:1.4.11"],
    enforcement: HYBRID,
  },
  {
    id: "interaction.state-feedback",
    category: INTERACTION,
    severity: WARNING,
    appliesTo: ["button", "toggle", "tab", "menu-item", "disclosure", "interactive-element"],
    rationale:
      "State feedback confirms current control state and prevents repeated or uncertain input.",
    requirement:
      "Interactive controls must expose pressed, selected, expanded, checked, current, loading, and disabled states when applicable.",
    remediation:
      "Add visible state styling and state attributes such as aria-pressed, aria-selected, aria-expanded, aria-current, disabled, or aria-disabled.",
    references: ["WCAG:1.4.11"],
    enforcement: MANUAL,
  },
  {
    id: "interaction.not-hover-only",
    category: INTERACTION,
    severity: ERROR,
    appliesTo: ["button", "link", "menu", "toolbar", "row-action", "interactive-element"],
    rationale:
      "Touch, keyboard, and assistive technology users cannot rely on hover-only affordances.",
    requirement: "Critical actions and information must not be available only on hover.",
    remediation: "Expose the action persistently or through focus, tap, and keyboard-accessible controls.",
    references: ["WCAG:1.4.13", "WCAG:2.1.1"],
    enforcement: MANUAL,
  },
  {
    id: "interaction.hover-focus-content",
    category: INTERACTION,
    severity: ERROR,
    appliesTo: ["tooltip", "popover", "hovercard", "menu", "disclosure"],
    rationale:
      "Content triggered by hover or focus must remain usable and dismissible.",
    requirement:
      "Hover or focus-triggered content must be dismissible, hoverable, and persistent.",
    remediation:
      "Allow Escape dismissal, keep content open while hovered/focused, and avoid premature disappearance.",
    references: ["WCAG:1.4.13"],
    enforcement: HYBRID,
  },
  {
    id: "interaction.pointer-cancellation",
    category: INTERACTION,
    severity: ERROR,
    appliesTo: ["button", "link", "drag-control", "touch-target", "interactive-element"],
    forbidden: ["onMouseDown activation", "onPointerDown activation", "onTouchStart activation"],
    rationale:
      "Users must be able to avoid or cancel accidental pointer activation.",
    requirement:
      "Pointer actions must not complete only on pointer down unless down-event activation is essential.",
    remediation:
      "Trigger actions on pointer up/click, support cancellation, or provide undo for destructive actions.",
    references: ["WCAG:2.5.2"],
    enforcement: HYBRID,
  },
  {
    id: "interaction.target-size-minimum",
    category: INTERACTION,
    severity: ERROR,
    appliesTo: ["button", "link", "touch-target", "icon-button", "row-action"],
    rationale:
      "Small or crowded targets increase accidental activation risk, especially on touch and dense enterprise tables.",
    requirement:
      "Interactive targets must meet minimum target size or spacing requirements.",
    remediation:
      "Use at least 24x24 CSS px target size or provide equivalent spacing; prefer 40x40 CSS px for primary app controls.",
    references: ["WCAG:2.5.8"],
    enforcement: HYBRID,
  },
  {
    id: "interaction.drag-selection-control",
    category: INTERACTION,
    severity: WARNING,
    appliesTo: ["draggable", "sortable", "drag-handle", "canvas"],
    rationale:
      "Drag operations should not accidentally select text or expose dragged content as active page content.",
    requirement: "Dragging must disable accidental text selection and mark dragged elements inert when needed.",
    remediation: "Disable text selection during drag and apply inert to dragged or background elements as appropriate.",
    enforcement: MANUAL,
  },
  {
    id: "interaction.autofocus-restraint",
    category: INTERACTION,
    severity: WARNING,
    appliesTo: ["input", "dialog", "form", "page"],
    rationale:
      "Unexpected autofocus can disorient users, open mobile keyboards, and disrupt navigation.",
    requirement: "Autofocus must be used sparingly and only for a single primary desktop input.",
    remediation: "Remove autofocus unless the flow has one obvious primary field and avoids mobile disruption.",
    references: ["WCAG:3.2.1"],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
