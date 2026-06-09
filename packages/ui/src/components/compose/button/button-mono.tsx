"use client";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonMono() {
  return (
    <ButtonPatternCard
      title="Mono"
      description="A monospaced treatment for technical labels, IDs, and command-like actions."
    >
      <Button
        className="font-mono uppercase tracking-[0.18em]"
        variant="outline"
      >
        Deploy
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonMono };
