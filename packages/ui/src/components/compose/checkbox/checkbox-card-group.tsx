"use client";

import {
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxCardGroup() {
  return (
    <CheckboxPatternCard
      description="Checkbox rows sit inside a bordered card container."
      title="Card checkbox with group"
    >
      <CheckboxFrame>
        <CheckboxList>
          <CheckboxOption
            description="Product manager, support engineer, and QA."
            id="checkbox-card-group-1"
            title="Team notifications"
          />
          <CheckboxOption
            description="New comments, replies, and mentions."
            id="checkbox-card-group-2"
            title="Community updates"
          />
          <CheckboxOption
            description="Incidents, patches, and policy changes."
            id="checkbox-card-group-3"
            title="Security updates"
          />
        </CheckboxList>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
