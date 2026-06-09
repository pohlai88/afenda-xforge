import assert from "node:assert/strict";
import { test } from "node:test";
import type { EntityMetadata } from "@repo/metadata";
import type { ReactElement, ReactNode } from "react";
import { EntityMetadataPanel, EntityMetadataTable } from "../index";

const metadata: EntityMetadata = {
  entity: "customer",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  table: {
    defaultSort: "name",
    columns: [
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "email",
        label: "Email",
        kind: "email",
      },
      {
        key: "status",
        label: "Status",
        kind: "status",
      },
    ],
  },
};

const rows = [
  {
    email: "hello@example.com",
    id: "row-1",
    name: "Acme",
    status: "active",
  },
] as const;

type TestElement = ReactElement<any, any>;

const collectElements = (
  node: ReactNode,
  elements: TestElement[] = []
): TestElement[] => {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectElements(child, elements);
    }

    return elements;
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return elements;
  }

  const element = node as TestElement;
  elements.push(element);
  collectElements(element.props.children, elements);

  return elements;
};

test("EntityMetadataTable exposes metadata-driven renderers", () => {
  const element = EntityMetadataTable({ metadata, rows }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "ActivityTable");

  const renderedCell = element.props.renderCell(
    metadata.table?.columns[1] as never,
    "hello@example.com",
    rows[0]
  ) as TestElement;

  assert.equal(renderedCell.type, "a");
  assert.equal(renderedCell.props.href, "mailto:hello@example.com");

  const statusCell = element.props.renderCell(
    metadata.table?.columns[2] as never,
    "active",
    rows[0]
  ) as TestElement;

  assert.equal((statusCell.type as { name?: string }).name, "StatusBadge");
  assert.equal(statusCell.props.tone, "success");
});

test("EntityMetadataPanel exposes the summary toolbar", () => {
  const element = EntityMetadataPanel({
    metadata,
    rows,
    totalRecords: 1,
  }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "Card");

  const toolbar = collectElements(element.props.children).find(
    (candidate) =>
      (candidate.type as { name?: string }).name === "MetadataToolbar"
  ) as TestElement | undefined;

  assert.ok(toolbar);
  assert.equal(toolbar?.props.title, "Customers");
  assert.equal(
    String(toolbar?.props.description ?? "")
      .toLowerCase()
      .includes("metadata-driven"),
    true
  );
  assert.equal(toolbar?.props.badges?.[0]?.label, "customer");
  assert.equal(toolbar?.props.badges?.[1]?.label, "1 record");
  assert.equal(toolbar?.props.badges?.[2]?.label, "3 columns");
  assert.equal(toolbar?.props.badges?.[3]?.label, "Sort: name");

  const elements = collectElements(element.props.children);
  const hasSeparator = elements.some(
    (candidate) => (candidate.type as { name?: string }).name === "Separator"
  );
  assert.equal(hasSeparator, true);
});

test("EntityMetadataPanel applies governed metadata customization", () => {
  const element = EntityMetadataPanel({
    customization: {
      entity: "customer",
      featureId: "customer.records",
      id: "customer.records.tenant-acme",
      scope: "tenant",
      table: {
        columns: [
          {
            key: "email",
            hidden: true,
          },
          {
            key: "name",
            label: "Account Name",
          },
        ],
        defaultSort: "name",
        title: "Accounts",
      },
      tenantId: "tenant-acme",
      title: "Accounts",
    },
    metadata: {
      ...metadata,
      id: "customer.records",
      title: "Customers",
    },
    rows,
    totalRecords: 1,
  }) as TestElement;

  const toolbar = collectElements(element.props.children).find(
    (candidate) =>
      (candidate.type as { name?: string }).name === "MetadataToolbar"
  ) as TestElement | undefined;

  assert.equal(toolbar?.props.title, "Accounts");
  assert.equal(toolbar?.props.badges?.[2]?.label, "2 columns");
});
