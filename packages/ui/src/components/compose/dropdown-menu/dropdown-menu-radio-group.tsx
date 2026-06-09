"use client";

import { useState } from "react";
import { Button } from "../../ui-shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import {
  ComposePatternCard,
  ComposePatternStage,
} from "../compose.pattern-shell";

export function DropdownMenuRadioGroupPattern() {
  const [density, setDensity] = useState("comfortable");

  return (
    <ComposePatternCard
      title="Radio Group"
      description="Single-choice view configuration for operational surfaces."
    >
      <ComposePatternStage>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Density</Button>}
          />
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Table density</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuRadioItem value="comfortable">
                Comfortable
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">
                Compact
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dense">Dense</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComposePatternStage>
    </ComposePatternCard>
  );
}
