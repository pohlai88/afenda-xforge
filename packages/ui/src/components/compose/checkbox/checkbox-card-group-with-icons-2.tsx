"use client";

import { BellIcon, ChartColumnIcon, WalletIcon } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import {
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxCardGroupWithIcons2() {
  return (
    <CheckboxPatternCard
      description="A denser icon layout with contextual status badges."
      title="Card checkbox group with icons"
    >
      <CheckboxFrame>
        <CheckboxList>
          <CheckboxOption
            id="checkbox-card-icons-2a"
            leading={
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ChartColumnIcon className="size-3.5" aria-hidden="true" />
              </span>
            }
            title="Analytics"
            trailing={<Badge variant="secondary">Live</Badge>}
          />
          <CheckboxOption
            id="checkbox-card-icons-2b"
            leading={
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <WalletIcon className="size-3.5" aria-hidden="true" />
              </span>
            }
            title="Billing"
            trailing={<Badge variant="outline">2</Badge>}
          />
          <CheckboxOption
            id="checkbox-card-icons-2c"
            leading={
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <BellIcon className="size-3.5" aria-hidden="true" />
              </span>
            }
            title="Alerts"
            trailing={<Badge variant="destructive">New</Badge>}
          />
        </CheckboxList>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
