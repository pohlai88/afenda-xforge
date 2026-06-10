import type { EntityMetadata } from "@repo/metadata";
import {
  createMetadataRenderContext,
  EntityMetadataPanel,
  MetadataStateBoundary,
} from "@repo/metadata-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { MetadataUiStoryFrame } from "./metadata-ui-story-utils";

const invoiceMetadata: EntityMetadata = {
  entity: "invoice",
  id: "storybook.metadata-ui.state-boundary",
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

function createStoryContext(surfaceId: string) {
  return createMetadataRenderContext(
    {
      permissions: {
        "invoice.read": true,
      },
      surfaceId,
    },
    {
      mode: "read",
      routeId: "storybook/metadata-ui-state-boundary",
      surfaceId,
    }
  );
}

const meta = {
  title: "Metadata UI/State Boundary",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  render: () => {
    const context = createStoryContext("storybook/metadata-ui-state-boundary/loading");

    return (
      <MetadataUiStoryFrame>
        <MetadataStateBoundary
          context={context}
          loadingDescription="Fetching invoice records from the tenant workspace."
          loadingTitle="Loading invoices"
          state="loading"
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const Empty: Story = {
  render: () => {
    const context = createStoryContext("storybook/metadata-ui-state-boundary/empty");

    return (
      <MetadataUiStoryFrame>
        <MetadataStateBoundary
          context={context}
          emptyDescription="Create an invoice to populate this list."
          emptyTitle="No invoices yet"
          state="empty"
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const Error: Story = {
  render: () => {
    const context = createStoryContext("storybook/metadata-ui-state-boundary/error");

    return (
      <MetadataUiStoryFrame>
        <MetadataStateBoundary
          context={context}
          error="Unable to load invoice records. The upstream service returned a 503."
          onRetry={() => {
            // Storybook fixture callback for Enterprise AC #3 retry wiring.
          }}
          state="error"
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const Forbidden: Story = {
  render: () => {
    const context = createStoryContext(
      "storybook/metadata-ui-state-boundary/forbidden"
    );

    return (
      <MetadataUiStoryFrame>
        <MetadataStateBoundary
          context={context}
          forbiddenDescription="Your tenant role cannot view invoice records."
          forbiddenTitle="Access restricted"
          state="forbidden"
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const Ready: Story = {
  render: () => {
    const context = createStoryContext("storybook/metadata-ui-state-boundary/ready");

    return (
      <MetadataUiStoryFrame>
        <MetadataStateBoundary context={context} state="ready">
          <div className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
            <p className="font-medium">Ready content</p>
            <p className="mt-2 text-muted-foreground text-sm">
              Consumers render governed children once async state resolves to ready.
            </p>
          </div>
        </MetadataStateBoundary>
      </MetadataUiStoryFrame>
    );
  },
};

export const PanelForbidden: Story = {
  render: () => {
    const context = createStoryContext(
      "storybook/metadata-ui-state-boundary/panel-forbidden"
    );

    return (
      <MetadataUiStoryFrame>
        <EntityMetadataPanel
          context={context}
          forbidden
          metadata={invoiceMetadata}
          rows={[]}
          title="Invoices"
          totalRecords={0}
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const PanelError: Story = {
  render: () => {
    const context = createStoryContext(
      "storybook/metadata-ui-state-boundary/panel-error"
    );

    return (
      <MetadataUiStoryFrame>
        <EntityMetadataPanel
          context={context}
          error="Unable to load invoices for this tenant."
          metadata={invoiceMetadata}
          onRetry={() => {
            // Storybook fixture callback for Enterprise AC #3 retry wiring.
          }}
          rows={[]}
          title="Invoices"
          totalRecords={0}
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const PanelLoading: Story = {
  render: () => {
    const context = createStoryContext(
      "storybook/metadata-ui-state-boundary/panel-loading"
    );

    return (
      <MetadataUiStoryFrame>
        <EntityMetadataPanel
          context={context}
          loading
          metadata={invoiceMetadata}
          rows={[]}
          title="Invoices"
          totalRecords={0}
        />
      </MetadataUiStoryFrame>
    );
  },
};

export const PanelEmpty: Story = {
  render: () => {
    const context = createStoryContext(
      "storybook/metadata-ui-state-boundary/panel-empty"
    );

    return (
      <MetadataUiStoryFrame>
        <EntityMetadataPanel
          context={context}
          emptyDescription="Create an invoice to populate this panel."
          emptyTitle="No invoices yet"
          metadata={invoiceMetadata}
          rows={[]}
          title="Invoices"
          totalRecords={0}
        />
      </MetadataUiStoryFrame>
    );
  },
};
