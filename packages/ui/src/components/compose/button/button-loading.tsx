"use client";

import { Loader2 } from "lucide-react";

import { Button, ButtonPatternCard } from "./button.shared";

function ButtonLoading() {
  return (
    <ButtonPatternCard
      title="Loading"
      description="A pending state with a spinner and disabled interaction."
    >
      <Button disabled>
        <Loader2 className="animate-spin" />
        Saving
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonLoading };
