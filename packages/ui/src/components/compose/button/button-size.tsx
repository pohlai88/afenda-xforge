"use client";

import { Plus } from "lucide-react";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonSize() {
  return (
    <ButtonPatternCard
      title="Size"
      description="The button scales across text and icon sizes using the shared primitive."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button>Default</Button>
        <Button size="lg">LG</Button>
        <Button aria-label="XS icon" size="icon-xs" variant="outline">
          <Plus />
        </Button>
        <Button aria-label="SM icon" size="icon-sm" variant="outline">
          <Plus />
        </Button>
        <Button aria-label="Default icon" size="icon" variant="outline">
          <Plus />
        </Button>
        <Button aria-label="LG icon" size="icon-lg" variant="outline">
          <Plus />
        </Button>
      </div>
    </ButtonPatternCard>
  );
}

export { ButtonSize };
