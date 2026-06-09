"use client";

import { ArrowRight } from "lucide-react";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonWithIcon() {
  return (
    <ButtonPatternCard
      title="With Icon"
      description="A standard button with a leading icon to clarify intent."
    >
      <Button>
        <ArrowRight />
        Continue
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonWithIcon };
