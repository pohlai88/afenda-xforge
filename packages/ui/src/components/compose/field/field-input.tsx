"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../../ui-shadcn/field";
import { Input } from "../../ui-shadcn/input";
import { ComposePatternCard } from "../compose.pattern-shell";

export function FieldInputPattern() {
  return (
    <ComposePatternCard
      title="Input"
      description="Labeled field composition with descriptions and stacked controls."
    >
      <FieldSet className="max-w-md">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-username">Username</FieldLabel>
            <Input id="field-username" placeholder="afenda-team" />
            <FieldDescription>
              Choose a stable handle for internal references.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="field-password">Password</FieldLabel>
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
            <Input id="field-password" type="password" placeholder="••••••••" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </ComposePatternCard>
  );
}
