"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPatternCard,
} from "./combobox.shared";

const options = ["Apple", "Banana", "Orange", "Grape"];

export function ComboboxForm() {
  return (
    <form className="space-y-4">
      <Combobox name="favoriteFruit" items={options} defaultValue="Apple">
        <ComboboxPatternCard
          description="The selected value can participate in native form submission."
          title="A combobox used within a form"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="combobox-form">
              Fruit
            </label>
            <ComboboxInput
              id="combobox-form"
              placeholder="Select your favorite fruit"
            />
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No options.</ComboboxEmpty>
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
      <Button type="submit">Submit</Button>
    </form>
  );
}
