import assert from "node:assert/strict";
import type { ReactElement } from "react";

import { renderMetadataTableCell } from "../src/components/metadata-cell-renderers";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  formatMetadataDate,
  formatMetadataMoney,
  formatMetadataNumber,
  resolveIntlLocale,
} from "../src/formatting/metadata-value-formatter";
import {
  DateFieldRenderer,
  MoneyFieldRenderer,
  NumberFieldRenderer,
} from "../src/renderers/fields";
import { MetadataFieldShell } from "../src/renderers/fields/metadata-field-shell";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const expandFieldShell = (node: unknown): TestElement =>
  (typeof node === "object" &&
  node &&
  "type" in node &&
  (node as TestElement).type === MetadataFieldShell
    ? MetadataFieldShell((node as TestElement).props)
    : node) as TestElement;

test("resolveIntlLocale maps short language codes to BCP47 locales", () => {
  assert.equal(resolveIntlLocale("en"), "en-US");
  assert.equal(resolveIntlLocale("vi"), "vi-VN");
  assert.equal(resolveIntlLocale("fr-FR"), "fr-FR");
});

test("formatMetadataNumber and formatMetadataMoney honor render context locale", () => {
  const englishContext = createMetadataRenderContext(
    { locale: "en", timezone: "UTC" },
    { mode: "read" }
  );
  const vietnameseContext = createMetadataRenderContext(
    { locale: "vi", timezone: "Asia/Ho_Chi_Minh" },
    { mode: "read" }
  );

  const englishNumber = formatMetadataNumber(1_234_567.89, englishContext);
  const vietnameseNumber = formatMetadataNumber(
    1_234_567.89,
    vietnameseContext
  );

  assert.notEqual(englishNumber, vietnameseNumber);
  assert.match(englishNumber, /1,234,567.89/);

  const englishMoney = formatMetadataMoney(1200.5, englishContext);
  const vietnameseMoney = formatMetadataMoney(1200.5, vietnameseContext);

  assert.notEqual(englishMoney, vietnameseMoney);
  assert.match(englishMoney, /\$/);
  assert.match(vietnameseMoney, /₫|VND/u);
});

test("formatMetadataDate applies locale and timezone from render context", () => {
  const utcContext = createMetadataRenderContext(
    { locale: "en", timezone: "UTC" },
    { mode: "read" }
  );
  const localContext = createMetadataRenderContext(
    { locale: "en", timezone: "Pacific/Auckland" },
    { mode: "read" }
  );

  const utcFormatted = formatMetadataDate(
    "2024-06-10T12:00:00.000Z",
    utcContext
  );
  const aucklandFormatted = formatMetadataDate(
    "2024-06-10T12:00:00.000Z",
    localContext
  );

  assert.notEqual(utcFormatted, aucklandFormatted);
  assert.match(utcFormatted, /10/);
  assert.match(aucklandFormatted, /11/);
});

test("numeric field renderers format display values in read mode", () => {
  const readContext = createMetadataRenderContext(
    { locale: "en", timezone: "UTC" },
    { mode: "read" }
  );

  const findInput = (element: TestElement): TestElement | undefined => {
    if (element.type?.name === "Input") {
      return element;
    }

    const children = element.props?.children;

    if (Array.isArray(children)) {
      for (const child of children) {
        if (child && typeof child === "object" && "type" in child) {
          const match = findInput(child as TestElement);
          if (match) {
            return match;
          }
        }
      }
    } else if (children && typeof children === "object" && "type" in children) {
      return findInput(children as TestElement);
    }

    return;
  };

  const numberInput = findInput(
    expandFieldShell(
      NumberFieldRenderer({
        context: readContext,
        field: { key: "quantity", kind: "number", label: "Quantity" },
        value: 1500.75,
      })
    )
  );
  const moneyInput = findInput(
    expandFieldShell(
      MoneyFieldRenderer({
        context: readContext,
        field: { key: "amount", kind: "money", label: "Amount" },
        value: 99.5,
      })
    )
  );
  const dateInput = findInput(
    expandFieldShell(
      DateFieldRenderer({
        context: readContext,
        field: { key: "issuedOn", kind: "date", label: "Issued on" },
        value: "2024-06-10",
      })
    )
  );

  assert.equal(numberInput?.props.defaultValue, "1,500.75");
  assert.match(String(moneyInput?.props.defaultValue), /\$/);
  assert.match(String(dateInput?.props.defaultValue), /2024/);
});

test("renderMetadataTableCell formats money and date columns with context locale", () => {
  const context = createMetadataRenderContext(
    { locale: "en", timezone: "UTC" },
    { mode: "read" }
  );

  const moneyCell = renderMetadataTableCell(
    { key: "total", kind: "money", label: "Total" },
    1200.5,
    context
  ) as TestElement;
  const dateCell = renderMetadataTableCell(
    { key: "issuedOn", kind: "date", label: "Issued on" },
    "2024-06-10",
    context
  ) as TestElement;

  assert.equal(moneyCell.props["data-locale-formatted"], "money");
  assert.match(String(moneyCell.props.children), /\$/);
  assert.equal(dateCell.props["data-locale-formatted"], "date");
  assert.match(String(dateCell.props.children), /2024/);
});
