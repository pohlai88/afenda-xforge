import type { EntityMetadata } from "@repo/metadata";
import type {
  MetadataActionContract,
  MetadataFieldContract,
} from "@repo/metadata-ui";
import {
  createMetadataRenderContext,
  EntityMetadataPanel,
  MetadataForm,
  MetadataStateBoundary,
} from "@repo/metadata-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";

const invoiceMetadata: EntityMetadata = {
  entity: "invoice",
  id: "storybook.metadata-ui.invoices",
  labels: {
    plural: "Invoices",
    singular: "Invoice",
  },
  table: {
    columns: [
      {
        field: "number",
        key: "number",
        label: "Invoice",
      },
      {
        field: "customer",
        key: "customer",
        label: "Customer",
        sortable: true,
      },
      {
        field: "total",
        key: "total",
        label: "Total",
        sortable: true,
      },
      {
        field: "status",
        key: "status",
        kind: "status",
        label: "Status",
        sortable: true,
      },
    ],
    defaultSort: "customer",
  },
  title: "Invoices",
};

const invoiceRows = [
  {
    customer: "Acme",
    id: "inv-001",
    number: "INV-001",
    status: "active",
    total: 1200.5,
  },
  {
    customer: "Globex",
    id: "inv-002",
    number: "INV-002",
    status: "draft",
    total: 800.25,
  },
  {
    customer: "Soylent",
    id: "inv-003",
    number: "INV-003",
    status: "inactive",
    total: 450,
  },
] as const;

const formFields: readonly MetadataFieldContract[] = [
  {
    key: "name",
    kind: "text",
    label: "Name",
    placeholder: "Acme Billing",
  },
  {
    key: "owner",
    kind: "email",
    label: "Owner email",
    placeholder: "owner@acme.test",
  },
  {
    key: "status",
    kind: "select",
    label: "Status",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
] as const;

const formActions: readonly MetadataActionContract[] = [
  {
    key: "save",
    kind: "update",
    label: "Save",
    surface: "button",
  },
] as const;

function MetadataUiSmokeStory() {
  const context = createMetadataRenderContext(
    {
      featureFlags: {
        "billing-editor": true,
      },
      permissions: {
        "invoice.update": true,
      },
      surfaceId: "storybook/metadata-ui-smoke",
    },
    {
      mode: "review",
      routeId: "storybook/metadata-ui-smoke",
      surfaceId: "storybook/metadata-ui-smoke",
    }
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-3">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.24em]">
          Public Surface
        </p>
        <h1 className="font-semibold text-4xl tracking-tight">
          Metadata UI Smoke
        </h1>
        <p className="max-w-3xl text-muted-foreground text-sm leading-7 md:text-base">
          Storybook fixture for the public metadata-ui boundary, including form,
          table panel, and ready state surfaces.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
          <MetadataForm
            actions={formActions}
            context={context}
            description="Smoke fixture for metadata-driven editing."
            fields={formFields}
            title="Profile"
            values={{
              name: "Acme Billing",
              owner: "owner@acme.test",
              status: "active",
            }}
          />
        </section>

        <EntityMetadataPanel
          context={context}
          metadata={invoiceMetadata}
          pageSize={2}
          rows={invoiceRows}
          totalRecords={invoiceRows.length}
        />
      </div>

      <section className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
        <MetadataStateBoundary context={context} state="ready">
          <div className="font-medium">Ready content</div>
        </MetadataStateBoundary>
      </section>
    </div>
  );
}

const meta = {
  title: "Metadata UI/Smoke",
  component: MetadataUiSmokeStory,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataUiSmokeStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const search = canvas.getByRole("textbox", { name: /search invoices/i });
    const customerSort = canvas.getByRole("button", {
      name: /sort by customer/i,
    });
    const nextButton = canvas.getByRole("button", { name: "Next" });
    const previousButton = canvas.getByRole("button", { name: "Previous" });
    const customerHeader = customerSort.closest("th");

    await expect(search).toBeVisible();
    await expect(customerHeader).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(nextButton);
    await expect(canvas.getByText("Soylent")).toBeVisible();

    await userEvent.click(previousButton);
    await expect(canvas.getByText("Acme")).toBeVisible();

    await userEvent.clear(search);
    await userEvent.type(search, "Globex");
    await expect(canvas.getByText("Globex")).toBeVisible();
    await expect(canvas.queryByText("Acme")).not.toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.click(customerSort);
    if (customerHeader) {
      await expect(customerHeader).toHaveAttribute("aria-sort", "descending");
    }

    await userEvent.click(customerSort);
    if (customerHeader) {
      await expect(customerHeader).toHaveAttribute("aria-sort", "none");
    }

    await expect(body.getByRole("heading", { name: "Profile" })).toBeVisible();
  },
};
