import assert from "node:assert/strict";
import type { ReactElement } from "react";

import { renderMetadataTableCell } from "../src/components/metadata-cell-renderers";
import { MetadataToolbar } from "../src/components/metadata-toolbar";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { formatMetadataTableCellValue } from "../src/formatting/metadata-value-formatter";
import { TextFieldRenderer } from "../src/renderers/fields";
import { MetadataFieldShell } from "../src/renderers/fields/metadata-field-shell";
import {
  METADATA_EMPTY_DISPLAY_VALUE,
  METADATA_FIELD_HELP_CLASS,
  METADATA_FIELD_LABEL_CLASS,
  METADATA_LONG_CONTENT_FIXTURES,
  METADATA_TABLE_CELL_CONTENT_CLASS,
  METADATA_TABLE_HEADER_LABEL_CLASS,
  METADATA_TOOLBAR_DESCRIPTION_CLASS,
  METADATA_TOOLBAR_TITLE_CLASS,
  resolveMetadataDisplayValue,
  resolveMetadataFormattedDisplayValue,
  resolveMetadataTableCellClassName,
} from "../src/visualization/content-length-visual-contract";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const baseContext = createMetadataRenderContext(undefined, { mode: "read" });

const normalizeChildren = (children: unknown): unknown[] => {
  if (children === null || children === undefined) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
};

const findElementWithText = (
  node: unknown,
  text: string
): TestElement | undefined => {
  if (!node || typeof node !== "object" || !("props" in node)) {
    return;
  }

  const element = node as TestElement;

  if (element.props?.children === text) {
    return element;
  }

  for (const child of normalizeChildren(element.props?.children)) {
    const match = findElementWithText(child, text);

    if (match) {
      return match;
    }
  }

  return;
};
const findElementByClassFragment = (
  node: unknown,
  fragment: string
): TestElement | undefined => {
  if (!node || typeof node !== "object" || !("props" in node)) {
    return;
  }

  const element = node as TestElement;

  if (String(element.props?.className ?? "").includes(fragment)) {
    return element;
  }

  for (const child of normalizeChildren(element.props?.children)) {
    const match = findElementByClassFragment(child, fragment);

    if (match) {
      return match;
    }
  }

  return;
};

const expandFieldShell = (node: unknown): TestElement =>
  (typeof node === "object" &&
  node &&
  "type" in node &&
  (node as TestElement).type === MetadataFieldShell
    ? MetadataFieldShell((node as TestElement).props)
    : node) as TestElement;

test("resolveMetadataDisplayValue normalizes null, undefined, and blank strings", () => {
  assert.equal(resolveMetadataDisplayValue(null), METADATA_EMPTY_DISPLAY_VALUE);
  assert.equal(
    resolveMetadataDisplayValue(undefined),
    METADATA_EMPTY_DISPLAY_VALUE
  );
  assert.equal(resolveMetadataDisplayValue(""), METADATA_EMPTY_DISPLAY_VALUE);
  assert.equal(
    resolveMetadataDisplayValue("   "),
    METADATA_EMPTY_DISPLAY_VALUE
  );
  assert.equal(resolveMetadataDisplayValue("Acme"), "Acme");
});

test("resolveMetadataFormattedDisplayValue normalizes empty formatted output", () => {
  assert.equal(
    resolveMetadataFormattedDisplayValue(""),
    METADATA_EMPTY_DISPLAY_VALUE
  );
  assert.equal(
    resolveMetadataFormattedDisplayValue("   "),
    METADATA_EMPTY_DISPLAY_VALUE
  );
  assert.equal(resolveMetadataFormattedDisplayValue("$1,200.00"), "$1,200.00");
});

test("formatMetadataTableCellValue returns empty placeholder for invalid money values", () => {
  assert.equal(
    formatMetadataTableCellValue(null, "money", baseContext),
    METADATA_EMPTY_DISPLAY_VALUE
  );
  assert.equal(
    formatMetadataTableCellValue("", "date", baseContext),
    METADATA_EMPTY_DISPLAY_VALUE
  );
});

test("content-length contract exposes truncation classes for table and field surfaces", () => {
  assert.match(METADATA_TABLE_CELL_CONTENT_CLASS, /truncate/);
  assert.match(METADATA_TABLE_HEADER_LABEL_CLASS, /truncate/);
  assert.match(METADATA_FIELD_LABEL_CLASS, /line-clamp-2/);
  assert.match(METADATA_FIELD_HELP_CLASS, /line-clamp-3/);
  assert.match(METADATA_TOOLBAR_TITLE_CLASS, /truncate/);
  assert.match(METADATA_TOOLBAR_DESCRIPTION_CLASS, /line-clamp-3/);
  assert.match(resolveMetadataTableCellClassName("tabular-nums"), /truncate/);
});

test("MetadataFieldShell clamps long labels and help text", () => {
  const fieldShell = expandFieldShell(
    TextFieldRenderer({
      context: baseContext,
      field: {
        key: "notes",
        kind: "text",
        label: METADATA_LONG_CONTENT_FIXTURES.label,
        helpText: METADATA_LONG_CONTENT_FIXTURES.description,
      },
      value: METADATA_LONG_CONTENT_FIXTURES.value,
    })
  );

  const label = fieldShell.props.children[0] as TestElement;
  const help = fieldShell.props.children[2] as TestElement;

  assert.match(String(label.props.className), /line-clamp-2/);
  assert.match(String(help.props.className), /line-clamp-3/);
});

test("MetadataToolbar truncates long titles and clamps descriptions", () => {
  const toolbar = MetadataToolbar({
    context: baseContext,
    description: METADATA_LONG_CONTENT_FIXTURES.description,
    title: METADATA_LONG_CONTENT_FIXTURES.title,
  }) as TestElement;

  const title = findElementByClassFragment(
    toolbar,
    METADATA_TOOLBAR_TITLE_CLASS
  );
  const description = findElementByClassFragment(
    toolbar,
    METADATA_TOOLBAR_DESCRIPTION_CLASS
  );

  assert.ok(title);
  assert.ok(description);
  assert.match(String(title?.props.className), /truncate/);
  assert.match(String(description?.props.className), /line-clamp-3/);
});

test("renderMetadataTableCell truncates long email and status values", () => {
  const emailCell = renderMetadataTableCell(
    { key: "email", kind: "email", label: "Email" },
    METADATA_LONG_CONTENT_FIXTURES.email,
    baseContext
  ) as TestElement;
  const statusCell = renderMetadataTableCell(
    { key: "status", kind: "status", label: "Status" },
    METADATA_LONG_CONTENT_FIXTURES.status,
    baseContext
  ) as TestElement;
  const emptyEmailCell = renderMetadataTableCell(
    { key: "email", kind: "email", label: "Email" },
    "",
    baseContext
  ) as TestElement;

  assert.match(String(emailCell.props.className), /truncate/);
  assert.match(String(statusCell.props.children.props.className), /truncate/);
  assert.equal(emptyEmailCell.props.children, METADATA_EMPTY_DISPLAY_VALUE);
});

test("status field renderer uses shared empty display placeholder", () => {
  const statusField = expandFieldShell(
    TextFieldRenderer({
      context: baseContext,
      field: {
        key: "status",
        kind: "status",
        label: "Status",
      },
      value: "",
    })
  );

  const badge = findElementWithText(statusField, METADATA_EMPTY_DISPLAY_VALUE);

  assert.ok(badge);
  assert.equal(badge?.props.children, METADATA_EMPTY_DISPLAY_VALUE);
});
