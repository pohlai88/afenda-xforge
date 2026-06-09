// Description: Date selector with dialog
// Order: 3

"use client";

import { useEffect, useState } from "react";
import { Button } from "../../ui-shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui-shadcn/dialog";
import { IconPlaceholder } from "../button-group/icon-placeholder";
import type { DateSelectorValue } from "./date-selector.shared";
import { DateSelector, formatDateValue } from "./date-selector.shared";

export function DateSelectorWithDialog() {
  const [value, setValue] = useState<DateSelectorValue | undefined>();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<
    DateSelectorValue | undefined
  >(value);

  const formattedValue = value ? formatDateValue(value) : "";
  const displayText = formattedValue || "Select a date";

  useEffect(() => {
    if (open) {
      setInternalValue(value);
    }
  }, [open, value]);

  const handleApply = () => {
    if (internalValue) {
      setValue(internalValue);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-56 justify-start">
          <IconPlaceholder
            lucide="CalendarIcon"
            tabler="IconCalendarEvent"
            hugeicons="Calendar04Icon"
            phosphor="CalendarBlankIcon"
            remixicon="RiCalendarLine"
          />
          {displayText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Select Due Date</DialogTitle>
        </DialogHeader>

        <DateSelector
          value={internalValue}
          onChange={setInternalValue}
          showInput={true}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
