"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonDestructive() {
  return (
    <ButtonPatternCard
      title="Destructive"
      description="A high-emphasis action for irreversible operations."
    >
      <Button variant="destructive">Delete project</Button>
    </ButtonPatternCard>
  );
}

export { ButtonDestructive };
