"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "../../ui-shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui-shadcn/popover";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPatternCard,
} from "./combobox.shared";

const options = ["United States", "Thailand", "Japan", "Germany", "Brazil"];

export function ComboboxInsidePopup() {
  return (
    <Popover>
      <Combobox items={options}>
        <ComboboxPatternCard
          description="The combobox sits inside a larger popup panel."
          title="A combobox rendered inside a popup"
        >
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-fit">
              Open country picker
              <ChevronDownIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[22rem]">
            <div className="space-y-3">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="combobox-popup-input"
                >
                  Select country
                </label>
                <ComboboxInput
                  id="combobox-popup-input"
                  placeholder="Search country"
                />
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
            </div>
          </PopoverContent>
        </ComboboxPatternCard>
      </Combobox>
    </Popover>
  );
}
