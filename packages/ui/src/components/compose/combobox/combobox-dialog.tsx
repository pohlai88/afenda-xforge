"use client";

import { Button } from "../../ui-shadcn/button";
import { Dialog, DialogContent, DialogTrigger } from "../../ui-shadcn/dialog";

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

export function ComboboxDialog() {
  return (
    <Dialog>
      <Combobox items={options}>
        <ComboboxPatternCard
          description="A dialog can host the combobox and related settings."
          title="A combobox used within a dialog"
        >
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="combobox-dialog"
                >
                  Choose a fruit
                </label>
                <ComboboxInput
                  id="combobox-dialog"
                  placeholder="Search fruit"
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
            </div>
          </DialogContent>
        </ComboboxPatternCard>
      </Combobox>
    </Dialog>
  );
}
