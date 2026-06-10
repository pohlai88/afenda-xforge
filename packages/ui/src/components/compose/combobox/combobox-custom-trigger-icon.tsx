"use client";

import { SparklesIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPatternCard,
  ComboboxTrigger,
} from "./combobox.shared";

const options = ["Apple", "Banana", "Orange", "Grape"];

export function ComboboxCustomTriggerIcon() {
  return (
    <Combobox items={options} defaultValue="Orange">
      <ComboboxPatternCard
        description="The trigger icon can be replaced with a custom accent icon."
        title="A combobox with a custom trigger icon"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="combobox-trigger-icon"
          >
            Choose a fruit
          </label>
          <ComboboxInput
            className="[&_[data-slot=input-group-control]]:pr-10"
            id="combobox-trigger-icon"
            placeholder="Open the custom trigger"
            showTrigger={false}
          >
            <ComboboxTrigger
              aria-label="Open fruit options"
              className="[&>svg:last-child]:hidden absolute inset-y-0 right-0 h-full w-10 rounded-l-none"
            >
              <SparklesIcon className="pointer-events-none size-4" />
            </ComboboxTrigger>
          </ComboboxInput>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No matches.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPatternCard>
    </Combobox>
  );
}
