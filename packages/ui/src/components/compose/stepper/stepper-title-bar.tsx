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
  useStepperItemContext,
} from "./stepper.shared";

const steps = [
  { step: 1, title: "Capture", content: "Collect the core inputs." },
  { step: 2, title: "Shape", content: "Organize the experience." },
  { step: 3, title: "Finalize", content: "Lock the final details." },
];

function StepBar() {
  const { active, completed } = useStepperItemContext();

  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: active || completed ? "100%" : "35%" }}
      />
    </div>
  );
}

export function StepperTitleBar() {
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
                <span className="min-w-0 flex-1">
                  <StepperTitle>{entry.title}</StepperTitle>
                  <StepBar />
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
