"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonFullWidth() {
  return (
    <ButtonPatternCard
      title="Full Width"
      description="A block-level action that fills the available inline space."
    >
      <Button className="w-full">Continue</Button>
    </ButtonPatternCard>
  );
}

export { ButtonFullWidth };
