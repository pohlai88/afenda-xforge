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
  { step: 1, title: "Plan", content: "Define the scope and goals." },
  { step: 2, title: "Build", content: "Implement the working draft." },
  { step: 3, title: "Launch", content: "Ship the workflow to users." },
];

export function StepperVertical() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Stepper
        defaultValue={1}
        orientation="vertical"
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <StepperNav className="w-full">
            {steps.map((entry, index) => (
              <StepperItem
                key={entry.step}
                step={entry.step}
                className="w-full"
              >
                <StepperTrigger className="w-full">
                  <StepperIndicator>{entry.step}</StepperIndicator>
                  <StepperTitle>{entry.title}</StepperTitle>
                </StepperTrigger>
                {index < steps.length - 1 ? <StepperSeparator /> : null}
              </StepperItem>
            ))}
          </StepperNav>

          <StepperPanel className="rounded-xl border bg-background p-5">
            {steps.map((entry) => (
              <StepperContent key={entry.step} value={entry.step}>
                <p className="text-sm text-muted-foreground">{entry.content}</p>
              </StepperContent>
            ))}
          </StepperPanel>
        </div>
      </Stepper>
    </div>
  );
}
