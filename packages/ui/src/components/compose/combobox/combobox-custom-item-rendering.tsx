"use client";

import { Badge } from "../../ui-shadcn/badge";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItemRow,
  ComboboxList,
  ComboboxPatternCard,
} from "./combobox.shared";

const reviewers = ["Michael Chen", "Sarah Kim", "Ava Thompson", "Noah Patel"];

export function ComboboxCustomItemRendering() {
  return (
    <Combobox items={reviewers} defaultValue="Michael Chen">
      <ComboboxPatternCard
        description="Each item can include richer metadata and status badges."
        title="A combobox with custom item rendering"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-custom-item">
            Assign reviewer
          </label>
          <ComboboxInput
            id="combobox-custom-item"
            placeholder="Search team member"
          />
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No reviewers found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItemRow
                key={item}
                value={item}
                title={item}
                description={
                  item === "Michael Chen"
                    ? "Primary reviewer"
                    : "Available today"
                }
                trailing={
                  item === "Michael Chen" ? (
                    <Badge variant="secondary">Lead</Badge>
                  ) : (
                    <Badge variant="outline">Online</Badge>
                  )
                }
              />
            )}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPatternCard>
    </Combobox>
  );
}
