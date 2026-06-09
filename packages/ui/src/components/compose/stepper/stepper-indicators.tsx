"use client";

import { CheckIcon, DotFilledIcon, ReloadIcon } from "@radix-ui/react-icons";

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
  { step: 1, title: "Details", content: "Capture the primary identity." },
  { step: 2, title: "Billing", content: "Assign the billing destination." },
  { step: 3, title: "Access", content: "Grant the correct permissions." },
];

export function StepperIndicators() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Stepper
        defaultValue={2}
        indicators={{
          active: <DotFilledIcon className="size-4" />,
          completed: <CheckIcon className="size-4" />,
          inactive: <span className="size-2 rounded-full bg-current/40" />,
          loading: <ReloadIcon className="size-4 animate-spin" />,
        }}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <StepperNav>
          {steps.map((entry, index) => (
            <StepperItem key={entry.step} step={entry.step} className="flex-1">
              <StepperTrigger className="flex-1">
                <StepperIndicator />
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
