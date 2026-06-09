"use client";

import { Badge } from "../../ui-shadcn/badge";
import { CheckboxOption, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxFeatureBadge() {
  return (
    <CheckboxPatternCard
      description="A badge highlights a featured or recommended choice."
      title="Checkbox with feature badge"
    >
      <CheckboxOption
        description="Get early access to productivity and workflow features."
        id="checkbox-feature-badge"
        title="Early access program"
        trailing={<Badge variant="secondary">Featured</Badge>}
      />
    </CheckboxPatternCard>
  );
}
