import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { renderMetadataAction } from "../src/adapters/ui-action-adapter";
import { renderMetadataField } from "../src/adapters/ui-field-adapter";
import { renderMetadataSection } from "../src/adapters/ui-section-adapter";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { resolveMetadataLabel } from "../src/localization/resolve-metadata-label";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

test("resolveMetadataLabel prefers catalog, locale labels, then metadata strings", () => {
  const context = createMetadataRenderContext({
    labelCatalog: {
      "entity.title": "Localized Title",
    },
    locale: "fr",
  });

  assert.equal(
    resolveMetadataLabel(context, {
      label: "Default",
      labelKey: "entity.title",
    }),
    "Localized Title"
  );
  assert.equal(
    resolveMetadataLabel(context, {
      label: "Default",
      labels: { en: "English", fr: "French" },
    }),
    "French"
  );
  assert.equal(
    resolveMetadataLabel(context, {
      label: "Fallback",
      labels: { en: "English" },
    }),
    "English"
  );
  assert.equal(
    resolveMetadataLabel(context, {
      label: "Metadata Label",
    }),
    "Metadata Label"
  );
});

test("field adapter resolves labels through render context locale", () => {
  const context = createMetadataRenderContext({
    labelCatalog: {
      "field.name": "Nom",
    },
    locale: "fr",
  });
  const result = renderMetadataField({
    context,
    field: {
      key: "name",
      kind: "text",
      label: "Name",
      labelKey: "field.name",
    },
    value: "Ada",
  });

  const element = result.element as TestElement;
  assert.match(JSON.stringify(element), /Nom/);
});

test("action adapter resolves labels through render context locale", () => {
  const context = createMetadataRenderContext({ locale: "fr" });
  const result = renderMetadataAction({
    action: {
      key: "save",
      kind: "submit",
      label: "Save",
      labels: { fr: "Enregistrer" },
    },
    context,
  });

  const element = result.element as TestElement;
  assert.match(JSON.stringify(element), /Enregistrer/);
});

test("section adapter wraps partial completeness with PartialState", () => {
  const context = createMetadataRenderContext({
    mode: "read",
    state: "partial",
  });
  const result = renderMetadataSection({
    context,
    section: {
      completenessDescription: "Some fields are unavailable.",
      key: "details",
      kind: "details",
      title: "Details",
    },
  });

  const element = result.element as TestElement;
  assert.match(JSON.stringify(element), /PartialState|partial/i);
});
