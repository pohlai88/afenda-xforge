import {
  DashboardGrid,
  WidgetContainer,
} from "@repo/ui/components/dashboard-grid";
import { KpiCard } from "@repo/ui/components/kpi-card";
import { ModuleStatusGrid } from "@repo/ui/components/module-status-grid";
import { StatePanel } from "@repo/ui/components/state-panel";
import type { Meta, StoryObj } from "@storybook/react";
import { enterpriseKpis, moduleHealth } from "./enterprise-fixtures";

const meta: Meta<typeof DashboardGrid> = {
  title: "Operations/Control Tower",
  component: DashboardGrid,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof DashboardGrid>;

export const ExecutiveControlTower: Story = {
  render: () => (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {enterpriseKpis.map((kpi) => (
          <KpiCard
            {...kpi}
            key={kpi.title}
            sparklineData={[12, 18, 16, 22, 27, 31, 29]}
          />
        ))}
      </section>

      <DashboardGrid columns={4} gap="lg">
        <WidgetContainer
          widget={{
            id: "module-health",
            size: "lg",
          }}
        >
          <ModuleStatusGrid columns={3} modules={moduleHealth} />
        </WidgetContainer>

        <WidgetContainer
          widget={{
            id: "operational-guidance",
            size: "md",
          }}
        >
          <StatePanel
            description="This layout keeps high-value operational signals visible without losing the data hierarchy."
            title="Control tower pattern"
            tone="info"
          />
        </WidgetContainer>
      </DashboardGrid>
    </div>
  ),
};

export const DarkExecutiveControlTower: Story = {
  ...ExecutiveControlTower,
  parameters: {
    theme: "dark",
  },
};
