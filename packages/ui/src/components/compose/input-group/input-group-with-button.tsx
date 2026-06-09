"use client";

import { ArrowUpRight } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "../../ui-shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../ui-shadcn/input-group";
import { ComposePatternCard } from "../compose.pattern-shell";

export function InputGroupWithButton() {
  return (
    <ComposePatternCard
      title="With Button"
      description="An input group that binds entry and action into one field."
    >
      <Field className="max-w-md">
        <FieldLabel htmlFor="input-group-url">Callback URL</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="input-group-url"
            placeholder="https://api.example.com/webhook"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-sm" aria-label="Open URL">
              <ArrowUpRight className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>
          Side actions are appropriate for validation, open, or copy flows.
        </FieldDescription>
      </Field>
    </ComposePatternCard>
  );
}
