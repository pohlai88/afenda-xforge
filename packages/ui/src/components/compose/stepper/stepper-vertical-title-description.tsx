"use client";

import {
  Stepper,
  StepperContent,
  StepperDescription,
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
    title: "Account",
    description: "Set up the account shell.",
    content: "Account setup is complete.",
  },
  {
    step: 2,
    title: "Profile",
    description: "Add the profile metadata.",
    content: "Profile setup is active.",
  },
  {
    step: 3,
    title: "Review",
    description: "Verify and submit the workflow.",
    content: "Review is waiting on final approval.",
  },
];

export function StepperVerticalTitleDescription() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Stepper
        defaultValue={2}
        orientation="vertical"
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <StepperNav className="w-full">
            {steps.map((entry, index) => (
              <StepperItem
                key={entry.step}
                step={entry.step}
                className="w-full"
              >
                <StepperTrigger className="w-full">
                  <StepperIndicator>{entry.step}</StepperIndicator>
                  <span className="grid min-w-0 gap-0.5">
                    <StepperTitle>{entry.title}</StepperTitle>
                    <StepperDescription>{entry.description}</StepperDescription>
                  </span>
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
