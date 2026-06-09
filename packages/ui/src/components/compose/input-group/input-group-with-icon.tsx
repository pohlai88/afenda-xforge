"use client";

import { Search } from "lucide-react";
import { Field, FieldLabel } from "../../ui-shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui-shadcn/input-group";
import { ComposePatternCard } from "../compose.pattern-shell";

export function InputGroupWithIcon() {
  return (
    <ComposePatternCard
      title="With Icon"
      description="An input group with a leading icon addon."
    >
      <Field className="max-w-md">
        <FieldLabel htmlFor="input-group-search">Search members</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="input-group-search"
            placeholder="Name, role, or email"
          />
        </InputGroup>
      </Field>
    </ComposePatternCard>
  );
}
