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
  useStepperContext,
} from "./stepper.shared";

const steps = [
  {
    step: 1,
    title: "Discover",
    content: "Map the objective and collect the inputs.",
  },
  {
    step: 2,
    title: "Structure",
    content: "Define the information architecture.",
  },
  { step: 3, title: "Polish", content: "Refine spacing, states, and copy." },
  { step: 4, title: "Ship", content: "Release the workflow to production." },
];

function ProgressBar() {
  const { activeValue } = useStepperContext();
  const percent = Math.min(100, (activeValue / steps.length) * 100);

  return (
    <div className="mt-5 grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="text-muted-foreground">
          Step {activeValue} of {steps.length}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function StepperProgress() {
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
                <StepperTitle>{entry.title}</StepperTitle>
              </StepperTrigger>
              {index < steps.length - 1 ? <StepperSeparator /> : null}
            </StepperItem>
          ))}
        </StepperNav>

        <ProgressBar />

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
