import { EntityMetadataTable } from "@repo/metadata-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { customerMetadata, customerRows } from "./enterprise-fixtures";

const meta: Meta<typeof EntityMetadataTable> = {
  title: "Metadata/Entity Table",
  component: EntityMetadataTable,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof EntityMetadataTable>;

export const Customers: Story = {
  render: () => (
    <EntityMetadataTable
      metadata={customerMetadata}
      pageSize={5}
      rows={customerRows}
      searchPlaceholder="Search customer, segment, owner, or email"
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
    <EntityMetadataTable
      emptyDescription="No customers have been onboarded into this tenant yet."
      emptyTitle="Tenant is empty"
      metadata={customerMetadata}
      rows={[]}
    />
  ),
};

export const CustomersForbidden: Story = {
  render: () => (
    <EntityMetadataTable forbidden metadata={customerMetadata} rows={[]} />
  ),
};

export const CustomersError: Story = {
  render: () => (
    <EntityMetadataTable
      error="The customer list could not be loaded from the tenant database."
      metadata={customerMetadata}
      onRetry={() => undefined}
      rows={[]}
    />
  ),
};
