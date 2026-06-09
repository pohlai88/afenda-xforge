"use client";

import { HelpCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui-shadcn/tooltip";
import {
  CheckboxFrame,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxWithTooltipInfo2() {
  return (
    <CheckboxPatternCard
      description="A compact variant with the hint placed inside the action area."
      title="Checkbox with label and tooltip info"
    >
      <TooltipProvider>
        <CheckboxFrame>
          <CheckboxOption
            description="Optional tips for advanced workflow visibility."
            id="checkbox-tooltip-info-2"
            title="Admin-only updates"
            trailing={
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      aria-label="More information"
                      className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                      type="button"
                    >
                      <HelpCircleIcon className="size-3.5" aria-hidden="true" />
                    </button>
                  }
                />
                <TooltipContent sideOffset={6}>
                  Visible only to users with elevated permissions.
                </TooltipContent>
              </Tooltip>
            }
          />
        </CheckboxFrame>
      </TooltipProvider>
    </CheckboxPatternCard>
  );
}
