import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

import { AnalyticsPreview } from "../../app/app/[locale]/theme-studio/_components/analytics-preview.tsx";
import { DataGridPreview } from "../../app/app/[locale]/theme-studio/_components/data-grid-preview.tsx";
import { ErpNavigationPreview } from "../../app/app/[locale]/theme-studio/_components/erp-navigation-preview.tsx";
import { ExecutiveDashboardPreview } from "../../app/app/[locale]/theme-studio/_components/executive-dashboard-preview.tsx";
import { FormExperiencePreview } from "../../app/app/[locale]/theme-studio/_components/form-experience-preview.tsx";
import { NexusLynxPreview } from "../../app/app/[locale]/theme-studio/_components/nexus-lynx-preview.tsx";
import { ThemeStudioPreviewRoot } from "../../app/app/[locale]/theme-studio/_components/theme-studio-preview-root.tsx";
import { THEME_STUDIO_PAGES } from "../../app/app/[locale]/theme-studio/_components/theme-studio-routes.ts";

const meta = {
  title: "Theme Studio",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Kitchen-sink tenant branding previews. Use the Storybook sidebar (same order as the app Theme Studio left nav) to switch pages.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeStudioPreviewRoot branding={DEFAULT_TENANT_BRANDING_SETTINGS}>
        <Story />
      </ThemeStudioPreviewRoot>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview01ExecutiveDashboard: Story = {
  name: `01 · Executive Dashboard (${THEME_STUDIO_PAGES[0]?.weight ?? "35%"})`,
  render: () => <ExecutiveDashboardPreview />,
};

export const Preview02DataGrid: Story = {
  name: `02 · Data Grid (${THEME_STUDIO_PAGES[1]?.weight ?? "25%"})`,
  render: () => <DataGridPreview />,
};

export const Preview03FormExperience: Story = {
  name: `03 · Form Experience (${THEME_STUDIO_PAGES[2]?.weight ?? "15%"})`,
  render: () => <FormExperiencePreview />,
};

export const Preview04ErpNavigation: Story = {
  name: `04 · ERP Navigation (${THEME_STUDIO_PAGES[3]?.weight ?? "10%"})`,
  render: () => <ErpNavigationPreview />,
};

export const Preview05NexusLynx: Story = {
  name: `05 · Nexus / Lynx (${THEME_STUDIO_PAGES[4]?.weight ?? "10%"})`,
  render: () => <NexusLynxPreview />,
};

export const Preview06Analytics: Story = {
  name: `06 · Analytics (${THEME_STUDIO_PAGES[5]?.weight ?? "5%"})`,
  render: () => <AnalyticsPreview />,
};
