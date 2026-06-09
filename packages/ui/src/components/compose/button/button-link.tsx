"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonLink() {
  return (
    <ButtonPatternCard
      title="Link"
      description="A button that adopts the visual style of inline text navigation."
    >
      <Button variant="link">Learn more</Button>
    </ButtonPatternCard>
  );
}

export { ButtonLink };
