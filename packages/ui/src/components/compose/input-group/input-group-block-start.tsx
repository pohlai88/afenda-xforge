"use client";

import { MessageSquare } from "lucide-react";
import { Field, FieldLabel } from "../../ui-shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../../ui-shadcn/input-group";
import { ComposePatternCard } from "../compose.pattern-shell";

export function InputGroupBlockStart() {
  return (
    <ComposePatternCard
      title="Block Start"
      description="An input group with block-level context above a larger text surface."
    >
      <Field className="max-w-md">
        <FieldLabel htmlFor="input-group-note">Release note</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>
              <MessageSquare className="size-4" />
              Internal update
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupTextarea
            id="input-group-note"
            rows={4}
            placeholder="Summarize changes for operators and reviewers."
          />
        </InputGroup>
      </Field>
    </ComposePatternCard>
  );
}
