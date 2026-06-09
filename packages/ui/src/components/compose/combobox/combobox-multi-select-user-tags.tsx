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

const users = [
  { name: "Michael Chen", role: "Lead" },
  { name: "Sarah Kim", role: "Design" },
  { name: "Ava Thompson", role: "QA" },
  { name: "Noah Patel", role: "Ops" },
];

export function ComboboxMultiSelectUserTags() {
  return (
    <Combobox
      multiple
      items={users.map((user) => user.name)}
      defaultValue={["Michael Chen", "Ava Thompson"]}
    >
      <ComboboxPatternCard
        description="User tags are selected from a multi-select combobox."
        title="A multi-select combobox with user tags"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="combobox-user-tags">
            Assign users
          </label>
          <ComboboxChips>
            <ComboboxValue>
              {(selectedValue: string[]) =>
                selectedValue.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              id="combobox-user-tags"
              placeholder="Add team members"
            />
          </ComboboxChips>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No users found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => {
              const user = users.find((entry) => entry.name === item);
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
                  trailing={<Badge variant="outline">{user?.role}</Badge>}
                />
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPatternCard>
    </Combobox>
  );
}
