"use client";

import { Avatar, AvatarFallback } from "../../ui-shadcn/avatar";
import { Badge } from "../../ui-shadcn/badge";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItemRow,
  ComboboxList,
  ComboboxPatternCard,
  ComboboxValue,
} from "./combobox.shared";

const members = [
  { name: "Engineering", tone: "Primary" },
  { name: "Product", tone: "Secondary" },
  { name: "Design", tone: "Neutral" },
  { name: "Operations", tone: "Muted" },
];

export function ComboboxInvisibleMemberTags() {
  return (
    <Combobox
      multiple
      items={members.map((member) => member.name)}
      defaultValue={["Engineering", "Product"]}
    >
      <ComboboxPatternCard
        description="The visible chrome is minimized so tags read like embedded metadata."
        title="Invisible combobox with member tags"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-member-tags">
            Team members
          </label>
          <ComboboxChips className="border-border/40 bg-transparent shadow-none">
            <ComboboxValue>
              {(selectedValue: string[]) =>
                selectedValue.map((item) => (
                  <ComboboxChip key={item} className="bg-muted/70">
                    {item}
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              id="combobox-member-tags"
              className="min-w-28"
              placeholder="Add members"
            />
          </ComboboxChips>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No members found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => {
              const member = members.find((entry) => entry.name === item);
              return (
                <ComboboxItemRow
                  key={item}
                  value={item}
                  leading={
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {item.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  }
                  title={item}
                  trailing={<Badge variant="secondary">{member?.tone}</Badge>}
                />
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPatternCard>
    </Combobox>
  );
}
