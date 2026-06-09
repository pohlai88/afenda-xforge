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
    description: "Create the account shell.",
    content: "Account details are complete.",
  },
  {
    step: 2,
    title: "Profile",
    description: "Fill in the profile metadata.",
    content: "Profile details are in progress.",
  },
  {
    step: 3,
    title: "Review",
    description: "Confirm everything before release.",
    content: "Review is the last step.",
  },
];

export function StepperTitleDescription() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Stepper
        defaultValue={2}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <StepperNav>
          {steps.map((entry, index) => (
            <StepperItem key={entry.step} step={entry.step} className="flex-1">
              <StepperTrigger className="flex-1">
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
