"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "../../ui-shadcn/field";
import { Input } from "../../ui-shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui-shadcn/select";
import { ComposePatternCard } from "../compose.pattern-shell";

export function FieldGroupPattern() {
  return (
    <ComposePatternCard
      title="Group"
      description="A grouped form section with clear subsection boundaries."
    >
      <FieldSet className="max-w-md rounded-lg border bg-background p-4">
        <FieldLegend>Project defaults</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-group-owner">Owner</FieldLabel>
            <Input id="field-group-owner" placeholder="Operations team" />
          </Field>
          <Field>
            <FieldLabel htmlFor="field-group-region">Region</FieldLabel>
            <Select defaultValue="singapore">
              <SelectTrigger id="field-group-region" className="w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singapore">Singapore</SelectItem>
                <SelectItem value="frankfurt">Frankfurt</SelectItem>
                <SelectItem value="virginia">Virginia</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Choose the default hosting region for new workloads.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <FieldSeparator>Visibility</FieldSeparator>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-group-tag">Tag prefix</FieldLabel>
            <Input id="field-group-tag" placeholder="xforge" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </ComposePatternCard>
  );
}
