import { StatePanel } from "@repo/ui/components/state-panel";
import { StatusBadge } from "@repo/ui/components/status-badge";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof StatePanel> = {
  title: "Foundations/Surface States",
  component: StatePanel,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof StatePanel>;

export const StateMatrix: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <StatePanel
        description="This is the default shell used for stable, neutral surfaces across the ERP."
        title="Neutral state"
        tone="neutral"
      />
      <StatePanel
        action={{
          label: "Review queue",
          href: "#",
        }}
        description="Use this tone for informational prompts or operational guidance."
        title="Informational state"
        tone="info"
      />
      <StatePanel
        action={{
          label: "Resolve issue",
          onClick: () => undefined,
        }}
        description="Use this tone when the user needs to take action before proceeding."
        title="Warning state"
        tone="warning"
      />
      <StatePanel
        action={{
          label: "Retry load",
          onClick: () => undefined,
        }}
        description="Use this tone for operational failures and recovery paths."
        title="Error state"
        tone="danger"
      />
    </div>
  ),
};

export const BadgeMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge tone="neutral">Draft</StatusBadge>
      <StatusBadge tone="info">Pending review</StatusBadge>
      <StatusBadge tone="warning">Blocked</StatusBadge>
      <StatusBadge tone="success">Live</StatusBadge>
      <StatusBadge tone="danger">Failed</StatusBadge>
    </div>
  ),
};
