import { auditEventMetadata } from "@repo/features-system-admin-control-plane/metadata/audit-event";
import { EntityMetadataPanel } from "@repo/metadata-ui/components";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

const auditRows = [
  {
    action: "customer.create",
    actorId: "user-001",
    actorRole: "admin",
    actorType: "user",
    approvalId: "",
    channel: "web",
    companyId: "",
    diffCount: 0,
    grantId: "",
    id: "audit-1",
    module: "customers",
    operationId: "op-1",
    outcome: "success",
    occurredAt: new Date("2026-06-01T12:00:00.000Z"),
    policyReference: "",
    reason: "Created customer",
    requestId: "req-1",
    route: "/customers",
    subjectId: "",
    subjectType: "",
    summary: "Customer created",
    surface: "dashboard",
    targetDisplayName: "Acme Ops",
    targetId: "customer-1",
    targetType: "customer",
    tenantId: "tenant-001",
  },
] as const;

function MetadataUiAuditStory() {
  const context = createMetadataRenderContext(
    {
      permissions: {
        "system-admin.audit.read": true,
      },
      surfaceId: "storybook/metadata-ui-audit",
    },
    {
      mode: "read",
      routeId: "storybook/metadata-ui-audit",
      surfaceId: "storybook/metadata-ui-audit",
    }
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-6 md:p-10">
      <EntityMetadataPanel
        context={context}
        metadata={auditEventMetadata}
        pageSize={5}
        rows={auditRows}
        searchPlaceholder="Search audit trail..."
        title="Event ledger"
        totalRecords={auditRows.length}
      />
    </div>
  );
}

const meta = {
  title: "Metadata UI/Audit",
  component: MetadataUiAuditStory,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataUiAuditStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EventLedger: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Event ledger")).toBeVisible();
    await expect(canvas.getByText("Customer created")).toBeVisible();
  },
};
