"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonGhost() {
  return (
    <ButtonPatternCard
      title="Ghost"
      description="A low-noise button for secondary actions embedded in dense layouts."
    >
      <Button variant="ghost">Snooze</Button>
    </ButtonPatternCard>
  );
}

export { ButtonGhost };
