"use client";

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle as StepperTitlePrimitive,
  StepperTrigger,
} from "./stepper.shared";

const steps = [
  { step: 1, title: "Account", content: "Set up the account foundation." },
  {
    step: 2,
    title: "Profile",
    content: "Add profile metadata and preferences.",
  },
  {
    step: 3,
    title: "Review",
    content: "Review the details before submission.",
  },
];

export function StepperTitlePattern() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Stepper
        defaultValue={1}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <StepperNav>
          {steps.map((entry, index) => (
            <StepperItem key={entry.step} step={entry.step} className="flex-1">
              <StepperTrigger className="flex-1">
                <StepperIndicator>{entry.step}</StepperIndicator>
                <StepperTitlePrimitive>{entry.title}</StepperTitlePrimitive>
              </StepperTrigger>
              {index < steps.length - 1 ? <StepperSeparator /> : null}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel className="mt-6 rounded-xl border bg-background p-5">
          {steps.map((entry) => (
            <StepperContent key={entry.step} value={entry.step}>
              <p className="text-sm text-muted-foreground">{entry.content}</p>
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  );
}
