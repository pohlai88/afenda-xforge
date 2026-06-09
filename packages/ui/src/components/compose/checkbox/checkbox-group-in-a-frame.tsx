"use client";

import { Separator } from "../../ui-shadcn/separator";
import {
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxGroupInAFrame() {
  return (
    <CheckboxPatternCard
      description="A framed group with a heading and divider treatment."
      title="Checkbox group in a frame"
    >
      <CheckboxFrame>
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Notification channels</h3>
            <p className="text-sm text-muted-foreground">
              Choose where you want to receive product updates.
            </p>
          </div>
          <Separator />
          <CheckboxList>
            <CheckboxOption id="checkbox-frame-1" title="Email" />
            <CheckboxOption id="checkbox-frame-2" title="SMS" />
            <CheckboxOption id="checkbox-frame-3" title="Push notifications" />
          </CheckboxList>
        </div>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
