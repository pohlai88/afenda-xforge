// Description: Environment switcher with indicator
// Order: 45

"use client";

import { useState } from "react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import { ButtonGroup, ButtonGroupText } from "../../ui-shadcn/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui-shadcn/tooltip";
import { IconPlaceholder } from "./icon-placeholder";

const environments = [
  {
    id: "development",
    label: "Dev",
    tooltip: "Local development environment",
    icon: (
      <IconPlaceholder
        lucide="Code2Icon"
        tabler="IconCode"
        hugeicons="Code01Icon"
        phosphor="CodeIcon"
        remixicon="RiCodeLine"
        aria-hidden="true"
      />
    ),
  },
  {
    id: "staging",
    label: "Staging",
    tooltip: "Pre-production mirror",
    icon: (
      <IconPlaceholder
        lucide="TestTube2Icon"
        tabler="IconTestPipe"
        hugeicons="TestTube01Icon"
        phosphor="TestTubeIcon"
        remixicon="RiTestTubeLine"
        aria-hidden="true"
      />
    ),
  },
  {
    id: "production",
    label: "Production",
    tooltip: "Live environment — affects real users",
    icon: (
      <IconPlaceholder
        lucide="GlobeIcon"
        tabler="IconWorld"
        hugeicons="Globe02Icon"
        phosphor="GlobeIcon"
        remixicon="RiGlobalLine"
        aria-hidden="true"
      />
    ),
  },
];

export function ButtonGroupEnvironmentSwitcherWithIndicator() {
  const [active, setActive] = useState("development");

  return (
    <ButtonGroup>
      {environments.map((env) => (
        <Tooltip key={env.id}>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                className={cn(active === env.id ? "bg-muted" : "")}
                onClick={() => setActive(env.id)}
              >
                {env.icon}
                {env.label}
              </Button>
            }
          />
          <TooltipContent>{env.tooltip}</TooltipContent>
        </Tooltip>
      ))}
      {active === "production" ? (
        <ButtonGroupText className="bg-transparent">
          <div className="bg-success size-1.5 rounded-full" />
          <span>Live</span>
        </ButtonGroupText>
      ) : null}
    </ButtonGroup>
  );
}
