"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonDashed() {
  return (
    <ButtonPatternCard
      title="Dashed"
      description="A boundary style that reads as a placeholder or optional action."
    >
      <Button className="border-dashed" variant="outline">
        Add filter
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonDashed };
