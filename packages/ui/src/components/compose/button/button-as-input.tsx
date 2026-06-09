"use client";

import { ChevronDown } from "lucide-react";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonAsInput() {
  return (
    <ButtonPatternCard
      title="As Input"
      description="A button styled to read like an input, often used as a picker trigger."
    >
      <Button
        className="w-full justify-between font-normal text-muted-foreground"
        variant="outline"
      >
        Select a date
        <ChevronDown />
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonAsInput };
