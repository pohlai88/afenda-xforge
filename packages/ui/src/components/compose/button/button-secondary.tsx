"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonSecondary() {
  return (
    <ButtonPatternCard
      title="Secondary"
      description="A neutral secondary action that sits behind the primary call to action."
    >
      <Button variant="secondary">Continue</Button>
    </ButtonPatternCard>
  );
}

export { ButtonSecondary };
