"use client";

import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui-shadcn/tooltip";
import { CheckboxOption, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxWithTooltipInfo() {
  return (
    <CheckboxPatternCard title="Checkbox with label and tooltip info">
      <TooltipProvider>
        <CheckboxOption
          description="Used for occasional updates and system notices."
          id="checkbox-tooltip-info-1"
          title="Product updates"
          trailing={
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    aria-label="What does this include?"
                    className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    type="button"
                  >
                    <InfoIcon className="size-3.5" aria-hidden="true" />
                  </button>
                }
              />
              <TooltipContent>
                Includes release notes and roadmap updates.
              </TooltipContent>
            </Tooltip>
          }
        />
      </TooltipProvider>
    </CheckboxPatternCard>
  );
}
