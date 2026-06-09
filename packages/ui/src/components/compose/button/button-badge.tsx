"use client";

import { Badge } from "../../ui-shadcn/badge";
import { Button, ButtonPatternCard } from "./button.shared";

function ButtonBadge() {
  return (
    <ButtonPatternCard
      title="Badge"
      description="A button that includes a compact badge for counts or status."
    >
      <Button variant="outline">
        Inbox
        <Badge size="xs" variant="secondary">
          12
        </Badge>
      </Button>
    </ButtonPatternCard>
  );
}

export { ButtonBadge };
