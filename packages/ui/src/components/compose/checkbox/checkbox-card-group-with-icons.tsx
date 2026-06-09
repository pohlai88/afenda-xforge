"use client";

import { CheckCircle2Icon, FileTextIcon, ShieldCheckIcon } from "lucide-react";

import {
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxCardGroupWithIcons() {
  return (
    <CheckboxPatternCard
      description="Each row pairs a checkbox with a contextual icon."
      title="Card checkbox group with icons"
    >
      <CheckboxFrame>
        <CheckboxList>
          <CheckboxOption
            description="Release notes and roadmap announcements."
            id="checkbox-card-icons-1"
            leading={
              <FileTextIcon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            }
            title="Documentation"
          />
          <CheckboxOption
            description="Quality checks and passing pipelines."
            id="checkbox-card-icons-2"
            leading={
              <CheckCircle2Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            }
            title="Build status"
          />
          <CheckboxOption
            description="Authentication and account safety."
            id="checkbox-card-icons-3"
            leading={
              <ShieldCheckIcon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            }
            title="Security alerts"
          />
        </CheckboxList>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
