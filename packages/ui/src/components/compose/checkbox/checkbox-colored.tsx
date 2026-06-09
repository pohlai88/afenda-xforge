"use client";

import { CheckboxOption, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxColored() {
  return (
    <CheckboxPatternCard title="Colored checkbox">
      <div className="flex flex-wrap gap-3">
        <CheckboxOption
          checkboxClassName="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
          className="w-[12rem]"
          id="checkbox-colored-success"
          title="Success"
        />
        <CheckboxOption
          checkboxClassName="data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
          className="w-[12rem]"
          id="checkbox-colored-warning"
          title="Warning"
        />
        <CheckboxOption
          checkboxClassName="data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500"
          className="w-[12rem]"
          id="checkbox-colored-info"
          title="Info"
        />
      </div>
    </CheckboxPatternCard>
  );
}
