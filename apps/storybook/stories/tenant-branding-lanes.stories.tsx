import { THEME_PRESETS } from "@repo/design-system";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import type { Meta, StoryObj } from "@storybook/react";

const FEATURE_LANE_DEMOS = [
  {
    featureId: "master-data.customers",
    label: "Customers",
  },
  {
    featureId: "master-data.currencies",
    label: "Currencies",
  },
  {
    featureId: "hr-suite.employee-management",
    label: "HR employees",
  },
  {
    featureId: "system-admin.overview",
    label: "Admin overview",
  },
] as const;

function TenantBrandingLanesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Tenant branding
        </p>
        <h1 className="font-semibold text-2xl tracking-tight">
          Theme preset + ERP visual lanes
        </h1>
        <p className="text-muted-foreground text-sm">
          Primary buttons use tenant theme presets. Lane accents scope module
          identity via <code className="text-foreground">activeFeatureId</code>.
        </p>
      </header>

      <Card className="border-lane-active-border">
        <CardHeader className="border-b border-lane-active-border bg-lane-active-muted">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Active lane surface</CardTitle>
            <Badge variant="lane">Lane accent</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <p className="text-lane-active-muted-foreground text-sm">
            Nav indicators, module badges, and chart accents use lane tokens —
            not <code className="text-foreground">--primary</code> or status
            colors.
          </p>
          <Button type="button">Primary CTA (tenant preset)</Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {THEME_PRESETS.map((preset) => (
          <Card key={preset.name} className="p-4">
            <p className="font-medium text-sm">{preset.title}</p>
            <p className="text-muted-foreground text-xs">{preset.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Introduction/Tenant Branding Lanes",
  component: TenantBrandingLanesDemo,
  parameters: {
    layout: "fullscreen",
    activeFeatureId: "master-data.customers",
  },
} satisfies Meta<typeof TenantBrandingLanesDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomerLane: Story = {
  parameters: {
    activeFeatureId: "master-data.customers",
  },
};

export const MoneyLane: Story = {
  parameters: {
    activeFeatureId: "master-data.currencies",
  },
};

export const PeopleLane: Story = {
  parameters: {
    activeFeatureId: "hr-suite.employee-management",
  },
};

export const IntelligenceLane: Story = {
  parameters: {
    activeFeatureId: "system-admin.overview",
  },
};

export const LaneMatrix: Story = {
  render: () => (
    <div className="grid gap-4 p-6 md:grid-cols-2">
      {FEATURE_LANE_DEMOS.map((demo) => (
        <div
          key={demo.featureId}
          className="rounded-lg border border-border p-4"
          data-feature={demo.featureId}
        >
          <p className="font-medium text-sm">{demo.label}</p>
          <p className="text-muted-foreground text-xs">{demo.featureId}</p>
          <p className="mt-2 text-muted-foreground text-xs">
            Open the individual lane story to preview scoped accents.
          </p>
        </div>
      ))}
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};
