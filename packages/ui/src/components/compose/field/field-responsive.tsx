"use client";

import { Field, FieldDescription, FieldLabel } from "../../ui-shadcn/field";
import { Input } from "../../ui-shadcn/input";
import { ComposePatternCard } from "../compose.pattern-shell";

export function FieldResponsive() {
  return (
    <ComposePatternCard
      title="Responsive"
      description="Field layout that switches between stacked and inline alignment."
    >
      <div className="rounded-lg border bg-background p-4">
        <Field orientation="responsive">
          <FieldLabel htmlFor="field-responsive-slug">
            Workspace slug
          </FieldLabel>
          <div className="space-y-1.5">
            <Input id="field-responsive-slug" placeholder="acme-prod" />
            <FieldDescription>
              Used in routes, audit logs, and API payloads.
            </FieldDescription>
          </div>
        </Field>
      </div>
    </ComposePatternCard>
  );
}
