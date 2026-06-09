"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonOutline() {
  return (
    <ButtonPatternCard
      title="Outline"
      description="A bordered action that stays visually light until hovered."
    >
      <Button variant="outline">Preview</Button>
    </ButtonPatternCard>
  );
}

export { ButtonOutline };
