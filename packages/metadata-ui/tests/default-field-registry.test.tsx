import assert from "node:assert/strict";

import { defaultFieldRegistry } from "../src/registry";
import {
  CheckboxFieldRenderer,
  DateFieldRenderer,
  MoneyFieldRenderer,
  NumberFieldRenderer,
  SelectFieldRenderer,
  SwitchFieldRenderer,
  TextareaFieldRenderer,
  TextFieldRenderer,
} from "../src/renderers/fields";
import { test } from "./test-runtime";

test("defaultFieldRegistry resolves the concrete field renderers", () => {
  assert.equal(
    defaultFieldRegistry.get("checkbox").renderer,
    CheckboxFieldRenderer
  );
  assert.equal(defaultFieldRegistry.get("date").renderer, DateFieldRenderer);
  assert.equal(defaultFieldRegistry.get("email").renderer, TextFieldRenderer);
  assert.equal(defaultFieldRegistry.get("money").renderer, MoneyFieldRenderer);
  assert.equal(
    defaultFieldRegistry.get("number").renderer,
    NumberFieldRenderer
  );
  assert.equal(
    defaultFieldRegistry.get("select").renderer,
    SelectFieldRenderer
  );
  assert.equal(defaultFieldRegistry.get("status").renderer, TextFieldRenderer);
  assert.equal(
    defaultFieldRegistry.get("switch").renderer,
    SwitchFieldRenderer
  );
  assert.equal(
    defaultFieldRegistry.get("textarea").renderer,
    TextareaFieldRenderer
  );
  assert.equal(defaultFieldRegistry.get("text").renderer, TextFieldRenderer);
});
