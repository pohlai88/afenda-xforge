"use client";

import type * as React from "react";
import { cn } from "../../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "../../ui-shadcn/combobox";

function ComboboxPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ComboboxItemRow({
  value,
  title,
  description,
  leading,
  trailing,
  className,
  itemClassName,
}: {
  value: string;
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ComboboxItem value={value} className={cn("py-2", itemClassName)}>
      <div className={cn("flex min-w-0 flex-1 items-center gap-3", className)}>
        {leading}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{title}</div>
          {description ? (
            <div className="text-xs text-muted-foreground">{description}</div>
          ) : null}
        </div>
        {trailing}
      </div>
    </ComboboxItem>
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemRow,
  ComboboxLabel,
  ComboboxList,
  ComboboxPatternCard,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
