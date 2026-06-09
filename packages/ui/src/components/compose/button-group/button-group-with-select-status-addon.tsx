// Description: Button group with select status addon
// Order: 27

import { useState } from "react";

import { cn } from "../../../lib/utils";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import { Input } from "../../ui-shadcn/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../../ui-shadcn/select";

const statuses = [
  { value: "1", label: "In Progress", color: "bg-violet-500" },
  { value: "2", label: "Completed", color: "bg-green-500" },
  { value: "3", label: "Pending", color: "bg-primary" },
  { value: "4", label: "Cancelled", color: "bg-yellow-500" },
  { value: "5", label: "Rejected", color: "bg-destructive" },
];

export function ButtonGroupWithSelectStatusAddon() {
  const [status, setStatus] = useState(statuses[1].value);
  const selectedStatus = statuses.find((item) => item.value === status);

  return (
    <ButtonGroup className="max-w-xs">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="min-w-36">
          <span className="flex items-center gap-2">
            <span
              className={cn("size-1.5 rounded-full", selectedStatus?.color)}
            />
            <span>{selectedStatus?.label ?? "Status"}</span>
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <span className="flex items-center gap-2">
                  <span className={cn("size-1.5 rounded-full", status.color)} />
                  <span>{status.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input placeholder="Search tasks..." />
    </ButtonGroup>
  );
}
