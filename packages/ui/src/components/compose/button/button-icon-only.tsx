"use client";

import { Plus } from "lucide-react";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonIconOnly() {
  return (
    <ButtonPatternCard
      title="Icon Only"
      description="A compact square action that relies on an icon and tooltip for context."
    >
      <Button aria-label="Create item" size="icon" variant="outline">
        <Plus />
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonIconOnly };
