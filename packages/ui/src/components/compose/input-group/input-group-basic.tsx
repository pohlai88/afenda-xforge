"use client";

import { Field, FieldDescription, FieldLabel } from "../../ui-shadcn/field";
import { InputGroup, InputGroupInput } from "../../ui-shadcn/input-group";
import { ComposePatternCard } from "../compose.pattern-shell";

export function InputGroupBasic() {
  return (
    <ComposePatternCard
      title="Basic"
      description="A compact input group for standard text entry."
    >
      <Field className="max-w-md">
        <FieldLabel htmlFor="input-group-basic">Workspace name</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="input-group-basic"
            placeholder="Acme Operations"
          />
        </InputGroup>
        <FieldDescription>
          Use input groups when the field needs structural addons or actions.
        </FieldDescription>
      </Field>
    </ComposePatternCard>
  );
}
