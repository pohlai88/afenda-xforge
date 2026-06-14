import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_ELEVATION,
  AFENDA_GOV_MOTION,
  AFENDA_GOV_MOTION_TOKEN,
} from "../catalogs/governance-reference.catalog";

const MOTION = "motion" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_MOTION_RULES = [
  {
    id: "motion.reduced-motion",
    category: MOTION,
    severity: ERROR,
    appliesTo: ["animation", "transition", "scroll", "parallax", "auto-motion"],
    forbidden: ["transition: all", "animation without reduced-motion fallback"],
    rationale:
      "Motion should not create vestibular discomfort and should remain performant.",
    requirement:
      "Motion must honor reduced-motion preferences and avoid animating unspecified properties.",
    remediation:
      "Use transform and opacity transitions, declare explicit transition properties, and add reduced-motion behavior.",
    references: [AFENDA_GOV_MOTION, "WCAG:2.3.3", "WCAG:2.2.2"],
    enforcement: HYBRID,
  },
  {
    id: "motion.no-autoplaying-nonessential-motion",
    category: MOTION,
    severity: ERROR,
    appliesTo: ["animation", "carousel", "video", "marquee", "background-motion", "auto-motion"],
    rationale:
      "Auto-playing nonessential motion can distract users and create accessibility or performance issues.",
    requirement:
      "Nonessential motion must not auto-play unless it can be paused, stopped, hidden, or disabled.",
    remediation:
      "Remove auto-play, provide pause/stop controls, or disable the motion when reduced-motion is requested.",
    references: [AFENDA_GOV_MOTION, "WCAG:2.2.2", "WCAG:2.3.3"],
    enforcement: HYBRID,
  },
  {
    id: "motion.no-motion-only-meaning",
    category: MOTION,
    severity: ERROR,
    appliesTo: ["status", "validation", "loading-state", "transition", "interactive-element"],
    rationale:
      "Users who disable or miss motion still need to understand state, status, and result changes.",
    requirement:
      "Motion must not be the only way to communicate state, meaning, urgency, or result.",
    remediation:
      "Pair motion with text, icon, persistent visual state, or semantic attributes.",
    references: [AFENDA_GOV_MOTION, "WCAG:1.4.1", "WCAG:2.3.3"],
    enforcement: MANUAL,
  },
  {
    id: "motion.purposeful-motion",
    category: MOTION,
    severity: WARNING,
    appliesTo: ["page", "dialog", "popover", "drawer", "toast", "interactive-element"],
    rationale:
      "Enterprise motion should clarify state, hierarchy, or continuity instead of adding distraction.",
    requirement:
      "Motion must have a functional purpose such as orientation, state feedback, continuity, or progressive disclosure.",
    remediation:
      "Remove decorative motion that does not support comprehension, feedback, or spatial continuity.",
    references: [AFENDA_GOV_MOTION],
    enforcement: MANUAL,
  },
  {
    id: "motion.duration-bounds",
    category: MOTION,
    severity: WARNING,
    appliesTo: ["transition", "animation", "microinteraction", "overlay"],
    rationale:
      "Unbounded motion makes interfaces feel sluggish, chaotic, or inconsistent across modules.",
    requirement:
      "Motion durations and easing must use governed timing tokens appropriate to the interaction.",
    remediation:
      "Use approved duration and easing tokens for microinteractions, entrances, exits, and overlay transitions.",
    references: [AFENDA_GOV_MOTION, AFENDA_GOV_MOTION_TOKEN],
    enforcement: HYBRID,
  },
  {
    id: "motion.no-layout-animation",
    category: MOTION,
    severity: ERROR,
    appliesTo: ["transition", "animation", "layout", "list", "panel"],
    forbidden: ["animating width", "animating height", "animating top", "animating left", "animating margin"],
    rationale:
      "Animating layout properties can trigger reflow and degrade interaction performance.",
    requirement:
      "Motion should avoid layout-triggering properties unless the interaction explicitly requires layout animation.",
    remediation:
      "Prefer transform and opacity; isolate unavoidable layout animation and validate performance.",
    references: [AFENDA_GOV_MOTION, "CoreWebVitals:INP"],
    enforcement: STATIC,
  },
  {
    id: "motion.entrance-exit-consistency",
    category: MOTION,
    severity: WARNING,
    appliesTo: ["dialog", "popover", "drawer", "toast", "dropdown", "tooltip"],
    rationale:
      "Consistent entrance and exit motion helps users understand surface layering and state changes.",
    requirement:
      "Overlays and transient surfaces must use consistent motion direction, duration, and easing.",
    remediation:
      "Use governed overlay motion presets instead of local one-off animation definitions.",
    references: [AFENDA_GOV_MOTION, AFENDA_GOV_ELEVATION],
    enforcement: MANUAL,
  },
  {
    id: "motion.loading-feedback",
    category: MOTION,
    severity: WARNING,
    appliesTo: ["loading-state", "skeleton", "spinner", "progress", "async-status"],
    rationale:
      "Loading motion must communicate progress without creating visual noise or false precision.",
    requirement:
      "Loading motion must match the operation duration and avoid excessive looping or distracting animation.",
    remediation:
      "Use skeletons for layout reservation, progress indicators for measurable work, and restrained spinners for short waits.",
    references: [AFENDA_GOV_MOTION, "WCAG:2.2.2"],
    enforcement: MANUAL,
  },
  {
    id: "motion.scroll-behavior",
    category: MOTION,
    severity: WARNING,
    appliesTo: ["anchor-link", "route-transition", "scroll-container", "skip-link"],
    rationale:
      "Programmatic scrolling can disorient users when it is abrupt, excessive, or ignores reduced-motion preferences.",
    requirement:
      "Programmatic scroll behavior must preserve orientation and honor reduced-motion preferences.",
    remediation:
      "Use instant scrolling when reduced motion is requested and ensure target content remains visible after scrolling.",
    references: [AFENDA_GOV_MOTION, "WCAG:2.3.3", "WCAG:2.4.1"],
    enforcement: HYBRID,
  },
  {
    id: "motion.state-feedback",
    category: MOTION,
    severity: WARNING,
    appliesTo: ["button", "toggle", "tab", "menu-item", "interactive-element"],
    rationale:
      "Motion can reinforce state changes, but it must not be the only indicator of state.",
    requirement:
      "Motion used for state feedback must be paired with persistent visual or semantic state.",
    remediation:
      "Pair animated feedback with visible state styling and attributes such as aria-expanded, aria-selected, or aria-pressed.",
    references: [AFENDA_GOV_MOTION, "WCAG:1.4.1"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
