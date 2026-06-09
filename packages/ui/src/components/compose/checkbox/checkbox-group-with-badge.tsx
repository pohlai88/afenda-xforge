"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxGroupWithBadge() {
  return (
    <CheckboxPatternCard
      description="Badges add counts and status context to each checkbox row."
      title="Checkbox group with badge"
    >
      <CheckboxFrame>
        <CheckboxList>
          <CheckboxOption
            id="checkbox-group-badge-1"
            title="Marketing"
            trailing={<Badge variant="secondary">12</Badge>}
          />
          <CheckboxOption
            id="checkbox-group-badge-2"
            title="Engineering"
            trailing={<Badge variant="outline">8</Badge>}
          />
          <CheckboxOption
            id="checkbox-group-badge-3"
            title="Support"
            trailing={<Badge variant="destructive">3</Badge>}
          />
        </CheckboxList>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
