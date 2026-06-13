import assert from "node:assert/strict";
import type { EntityMetadata } from "@repo/metadata";
import type { ReactElement, ReactNode } from "react";
import {
  EntityMetadataPanel,
  EntityMetadataTable,
  renderMetadataPanelResult,
  renderMetadataTableResult,
} from "../index";
import { test } from "./test-runtime";

const metadata: EntityMetadata = {
  customization: {
    presentation: {
      density: true,
      tone: true,
      variant: true,
    },
    scopes: ["tenant", "company"],
  },
  entity: "customer",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  table: {
    customization: {
      columns: true,
      defaultSort: true,
      title: true,
    },
    defaultSort: "name",
    columns: [
      {
        customization: {
          label: true,
        },
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        customization: {
          hidden: true,
          label: true,
        },
        key: "email",
        label: "Email",
        kind: "email",
      },
      {
        customization: {
          hidden: true,
          label: true,
        },
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

const createTelemetrySink = (): {
  events: Array<{ name: string }>;
  sink: {
    emit: (event: { name: string }) => void;
  };
} => {
  const events: Array<{ name: string }> = [];

  return {
    events,
    sink: {
      emit: (event: { name: string }): void => {
        events.push({ name: event.name });
      },
    },
  };
};

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

test("renderMetadataTableResult emits render telemetry with the threaded context", () => {
  const telemetry = createTelemetrySink();

  const result = renderMetadataTableResult({
    context: {
      routeId: "tests/metadata-table",
      surfaceId: "metadata-table:test-surface",
      telemetry: telemetry.sink,
    },
    metadata,
    rows,
  });

  assert.equal(
    (result.element.type as { name?: string }).name,
    "ActivityTable"
  );
  assert.deepEqual(
    telemetry.events.map((event) => event.name),
    ["metadata.table.render.started", "metadata.table.render.completed"]
  );
  assert.equal(result.diagnostics.length, 0);
});

test("renderMetadataPanelResult formats money columns with locale context", () => {
  const telemetry = createTelemetrySink();

  const result = renderMetadataPanelResult({
    context: {
      locale: "en",
      routeId: "tests/metadata-panel",
      telemetry: telemetry.sink,
      timezone: "UTC",
    },
    metadata: {
      ...metadata,
      table: {
        columns: [
          {
            key: "total",
            kind: "money",
            label: "Total",
          },
        ],
        defaultSort: "total",
      },
    },
    rows: [{ id: "row-1", total: 1200.5 }],
  });

  assert.equal((result.element.type as { name?: string }).name, "Card");
  assert.equal(result.diagnostics.length, 0);

  const table = collectElements(result.element).find(
    (candidate) =>
      (candidate.type as { name?: string }).name === "ActivityTable"
  ) as TestElement | undefined;

  assert.ok(table);
  assert.equal(table?.props.locale, "en");
  assert.equal(table?.props.timezone, "UTC");

  const moneyCell = table?.props.renderCell(
    { key: "total", kind: "money", label: "Total" },
    1200.5,
    { id: "row-1", total: 1200.5 }
  ) as TestElement;

  assert.equal(moneyCell.props["data-locale-formatted"], "money");
  assert.match(String(moneyCell.props.children), /\$/);
});

test("EntityMetadataPanel accepts layered customization input", () => {
  const element = EntityMetadataPanel({
    customizationLayers: {
      company: {
        baseMetadataFingerprint: "customer.records@2026-06-09",
        companyId: "company-main",
        created: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        entity: "customer",
        featureId: "customer.records",
        fields: [
          {
            key: "name",
            label: "Company Account Name",
          },
        ],
        id: "customer.records.company-main",
        published: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        scope: "company",
        status: "published",
        tenantId: "tenant-acme",
        updated: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        version: 2,
      },
      tenant: {
        baseMetadataFingerprint: "customer.records@2026-06-09",
        created: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        entity: "customer",
        featureId: "customer.records",
        fields: [
          {
            key: "email",
            hidden: true,
          },
        ],
        id: "customer.records.tenant-acme",
        published: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        scope: "tenant",
        status: "published",
        tenantId: "tenant-acme",
        title: "Tenant Accounts",
        updated: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        version: 1,
      },
    },
    customizationOptions: {
      companyAware: true,
    },
    metadata: {
      ...metadata,
      fields: [
        {
          customization: {
            label: true,
          },
          key: "name",
          kind: "text",
          label: "Name",
        },
        {
          customization: {
            hidden: "allow",
          },
          key: "email",
          kind: "text",
          label: "Email",
        },
      ],
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

  assert.equal(toolbar?.props.title, "Tenant Accounts");
});

test("renderMetadataTableResult passes selectedRowId to ActivityTable", () => {
  const result = renderMetadataTableResult({
    context: {
      actorId: "user-001",
      featureId: "customer.records",
      locale: "en",
      permissions: {},
      tenantId: "tenant-acme",
      timezone: "UTC",
    },
    metadata,
    rows: [...rows, { ...rows[0], id: "row-2", name: "Beta" }],
    selectedRowId: "row-2",
  });

  const table = collectElements(result.element).find(
    (candidate) =>
      (candidate.type as { name?: string }).name === "ActivityTable"
  ) as TestElement | undefined;

  assert.ok(table);
  assert.equal(table?.props.selectedRowId, "row-2");
});
