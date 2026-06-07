import { EntityMetadataPanel, EntityMetadataTable } from "@repo/metadata-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { customerMetadata, customerRows } from "./enterprise-fixtures";

const meta: Meta<typeof EntityMetadataPanel> = {
  title: "Metadata/Entity Panel",
  component: EntityMetadataPanel,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof EntityMetadataPanel>;

export const Customers: Story = {
  render: () => (
    <EntityMetadataPanel
      metadata={customerMetadata}
      pageSize={5}
      rows={customerRows}
      searchPlaceholder="Search customer, segment, owner, or email"
      totalRecords={customerRows.length}
    />
  ),
};

export const CustomersDark: Story = {
  ...Customers,
  parameters: {
    theme: "dark",
  },
};

export const CustomersEmpty: Story = {
  render: () => (
    <EntityMetadataPanel
      emptyDescription="No customers have been onboarded into this tenant yet."
      emptyTitle="Tenant is empty"
      metadata={customerMetadata}
      rows={[]}
    />
  ),
};

export const CustomersForbidden: Story = {
  render: () => (
    <EntityMetadataPanel forbidden metadata={customerMetadata} rows={[]} />
  ),
};

export const CustomersError: Story = {
  render: () => (
    <EntityMetadataPanel
      error="The customer list could not be loaded from the tenant database."
      metadata={customerMetadata}
      onRetry={() => undefined}
      rows={[]}
    />
  ),
};

export const CustomersTableOnly: StoryObj<typeof EntityMetadataTable> = {
  render: () => (
    <EntityMetadataTable
      metadata={customerMetadata}
      pageSize={5}
      rows={customerRows}
      searchPlaceholder="Search customer, segment, owner, or email"
    />
  ),
};
