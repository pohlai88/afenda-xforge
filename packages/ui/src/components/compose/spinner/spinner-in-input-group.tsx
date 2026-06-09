// Description: Spinner in input group.
// Order: 4

import { Field, FieldLabel } from "../../ui-shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui-shadcn/input-group";
import { Spinner } from "../../ui-shadcn/spinner";

export function SpinnerInInputGroup() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="search-loading">Searching</FieldLabel>
      <InputGroup id="search-loading">
        <InputGroupInput placeholder="Search records…" />
        <InputGroupAddon>
          <Spinner className="size-4" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
