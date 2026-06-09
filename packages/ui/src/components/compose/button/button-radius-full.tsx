"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonRadiusFull() {
  return (
    <ButtonPatternCard
      title="Radius Full"
      description="A pill shape that reads softer than the default rounded rectangle."
    >
      <Button className="rounded-full" variant="outline">
        Follow
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonRadiusFull };
