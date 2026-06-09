import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { StepperControlled } from "./stepper-controlled";
import { StepperDefault } from "./stepper-default";
import { StepperProgress } from "./stepper-progress";
import { StepperVertical } from "./stepper-vertical";

export type StepperPatternSpec = ComposeRenderablePatternSpec;

export const stepperPatternCatalog = [
  {
    name: "default",
    title: "Default",
    description: "A standard stepper for multi-step workflows.",
    component: StepperDefault,
  },
  {
    name: "controlled",
    title: "Controlled",
    description: "A controlled stepper for app-driven workflow state.",
    component: StepperControlled,
  },
  {
    name: "vertical",
    title: "Vertical",
    description: "A vertical stepper for stacked process flows.",
    component: StepperVertical,
  },
  {
    name: "progress",
    title: "Progress",
    description: "A stepper with explicit progress treatment.",
    component: StepperProgress,
  },
] as const satisfies readonly StepperPatternSpec[];

export type StepperPatternName = (typeof stepperPatternCatalog)[number]["name"];

export const stepperPatternCount = stepperPatternCatalog.length;
export const stepperPatternNames = stepperPatternCatalog.map(
  (pattern) => pattern.name,
) as StepperPatternName[];
