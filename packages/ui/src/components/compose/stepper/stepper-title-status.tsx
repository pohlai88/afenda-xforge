"use client";

import { Badge } from "../../ui-shadcn/badge";
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
  { step: 1, title: "Account", content: "Account setup is complete." },
  {
    step: 2,
    title: "Profile",
    content: "Profile verification is currently active.",
  },
  {
    step: 3,
    title: "Review",
    content: "Review will begin after profile completion.",
  },
];

function StatusBadge() {
  const { active, completed, loading } = useStepperItemContext();

  if (loading) {
    return <Badge variant="secondary">In progress</Badge>;
  }

  if (completed) {
    return <Badge>Complete</Badge>;
  }

  if (active) {
    return <Badge variant="outline">Current</Badge>;
  }

  return <Badge variant="secondary">Pending</Badge>;
}

export function StepperTitleStatus() {
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
                  <span className="flex items-center gap-2">
                    <StepperTitle>{entry.title}</StepperTitle>
                    <StatusBadge />
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
              <p className="text-sm text-muted-foreground">{entry.content}</p>
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    </div>
  );
}
