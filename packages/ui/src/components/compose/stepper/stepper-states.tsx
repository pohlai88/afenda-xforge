"use client";

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "./stepper.shared";

const steps = [
  {
    step: 1,
    title: "Plan",
    description: "Draft the work and confirm the scope.",
    content: "The plan is complete and ready to move forward.",
  },
  {
    step: 2,
    title: "Build",
    description: "Implement the core flow and wire up the UI.",
    content: "Build is active and in progress.",
  },
  {
    step: 3,
    title: "Review",
    description: "QA the experience and verify edge cases.",
    content: "Review is pending approval.",
  },
];

export function StepperStates() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Stepper
        defaultValue={2}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <StepperNav>
          {steps.map((entry, index) => (
            <StepperItem
              key={entry.step}
              step={entry.step}
              completed={entry.step < 2}
              loading={entry.step === 3}
              className="flex-1"
            >
              <StepperTrigger className="flex-1">
                <StepperIndicator>{entry.step}</StepperIndicator>
                <span className="grid gap-0.5">
                  <StepperTitle>{entry.title}</StepperTitle>
                  <span className="text-xs text-muted-foreground">
                    {entry.description}
                  </span>
                </span>
              </StepperTrigger>
              {index < steps.length - 1 ? <StepperSeparator /> : null}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel className="mt-6 rounded-xl border bg-background p-5">
          {steps.map((entry) => (
            <StepperContent key={entry.step} value={entry.step}>
              <div className="grid gap-2">
                <h3 className="text-base font-semibold">{entry.title}</h3>
                <p className="text-sm text-muted-foreground">{entry.content}</p>
              </div>
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  );
}
