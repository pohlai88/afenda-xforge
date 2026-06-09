"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonDisabled() {
  return (
    <ButtonPatternCard
      title="Disabled"
      description="A non-interactive button that preserves layout and affordance."
    >
      <Button disabled>Unavailable</Button>
    </ButtonPatternCard>
  );
}

export { ButtonDisabled };
