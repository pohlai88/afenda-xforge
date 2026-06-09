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
    title: "User details",
    content: "Collect the account holder information.",
  },
  {
    step: 2,
    title: "Payment info",
    content: "Add a card, wallet, or invoice profile.",
  },
];

export function StepperDefault() {
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
                <StepperTitle>{entry.title}</StepperTitle>
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
