import type { DashboardTableRow, TableColumnMetadata } from "@repo/metadata";
import { ActivityTable } from "@repo/ui/components/activity-table";
import { StatusBadge } from "@repo/ui/components/status-badge";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { activityRows } from "./enterprise-fixtures";

const columns = [
  { key: "timestamp", label: "Time" },
  { key: "module", label: "Module" },
  { key: "action", label: "Action" },
  { key: "entity", label: "Entity" },
  { key: "status", label: "Status", kind: "status" as const },
  { key: "user", label: "User" },
] as const;

const meta: Meta<typeof ActivityTable> = {
  title: "Data/Activity Table",
  component: ActivityTable,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof ActivityTable>;

const renderStatus = (value: unknown): ReactNode => {
  if (value === "active") {
    return <StatusBadge tone="success">Live</StatusBadge>;
  }

  if (value === "pending") {
    return <StatusBadge tone="info">Pending</StatusBadge>;
  }

  if (value === "inactive") {
    return <StatusBadge tone="warning">Archived</StatusBadge>;
  }

  return value instanceof Date ? value.toLocaleString() : String(value ?? "-");
};

export const Ready: Story = {
  render: () => (
    <ActivityTable
      columns={columns}
      defaultSortColumn="timestamp"
      pageSize={4}
      renderCell={(
        column: TableColumnMetadata,
        value: DashboardTableRow[string]
      ) => (column.key === "status" ? renderStatus(value) : undefined)}
      rows={activityRows}
      searchPlaceholder="Search accounting, operations, or CRM events"
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <ActivityTable
      columns={columns}
      emptyDescription="No operational events were captured for the selected period."
      emptyTitle="Nothing to review"
      rows={[]}
      searchPlaceholder="Search events"
    />
  ),
};

export const Loading: Story = {
  render: () => <ActivityTable columns={columns} loading rows={[]} />,
};

export const ErrorState: Story = {
  render: () => (
    <ActivityTable
      columns={columns}
      error="The analytics feed is temporarily unavailable."
      onRetry={() => undefined}
      rows={[]}
    />
  ),
};

export const ForbiddenState: Story = {
  render: () => <ActivityTable columns={columns} forbidden rows={[]} />,
};
