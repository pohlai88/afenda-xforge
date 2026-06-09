"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Button } from "../../ui-shadcn/button";
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
  useStepperContext,
} from "./stepper.shared";

const steps = [
  {
    step: 1,
    title: "Account",
    content: "Create your account and confirm the email address.",
  },
  {
    step: 2,
    title: "Profile",
    content: "Add your profile details and preferences.",
  },
  {
    step: 3,
    title: "Review",
    content: "Check the summary before submitting.",
  },
  {
    step: 4,
    title: "Complete",
    content: "Finish the workflow and land on the dashboard.",
  },
];

function ControlledActions() {
  const { activeValue, setActiveValue } = useStepperContext();
  const total = steps.length;

  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => setActiveValue(Math.max(1, activeValue - 1))}
        disabled={activeValue === 1}
      >
        <ChevronLeftIcon className="size-4" />
        Back
      </Button>
      <span className="text-sm text-muted-foreground">
        {activeValue} / {total}
      </span>
      <Button
        type="button"
        onClick={() => setActiveValue(Math.min(total, activeValue + 1))}
        disabled={activeValue === total}
      >
        Next
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}

export function StepperControlled() {
  const [value, setValue] = useState(2);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Stepper
        value={value}
        onValueChange={setValue}
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
          <ControlledActions />
        </StepperPanel>
      </Stepper>
    </div>
  );
}
