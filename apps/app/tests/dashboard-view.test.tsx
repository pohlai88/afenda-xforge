import { companyMetadata } from "@repo/features-master-data-companies/metadata";
import { customerMetadata } from "@repo/features-master-data-customers/metadata";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DashboardSectionState } from "../app/(authenticated)/dashboard/dashboard-view.tsx";
import { DashboardView } from "../app/(authenticated)/dashboard/dashboard-view.tsx";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";

const createDashboardContext = () =>
  createAppMetadataContext({
    featureId: "system-admin.overview",
    permissions: ["master-data.customers:read", "master-data.companies:read"],
    tenantId: "tenant-001",
    userId: "user-001",
  });

const createReadyState = (
  rows: readonly { id: string; [key: string]: string | number | boolean }[]
): DashboardSectionState => ({
  data: {
    items: rows,
    total: rows.length,
  },
  status: "ready",
});

const createReadyActivity = () => ({
  data: {
    events: [
      {
        action: "customer.create",
        id: "audit-1",
        occurredAt: new Date("2026-06-01T12:00:00.000Z"),
        outcome: "success",
        summary: "Customer created",
      },
    ],
    total: 1,
  },
  status: "ready" as const,
});

describe("DashboardView", () => {
  it("renders the ready dashboard consumer with metadata-ui sections", () => {
    render(
      <DashboardView
        activity={createReadyActivity()}
        companies={{
          metadata: companyMetadata,
          state: createReadyState([
            { id: "company-1", name: "Acme Holdings", status: "active" },
          ]),
        }}
        context={createDashboardContext()}
        customers={{
          metadata: customerMetadata,
          state: createReadyState([
            {
              email: "ops@acme.test",
              id: "customer-1",
              name: "Acme Ops",
              status: "active",
            },
          ]),
        }}
        headerActions={<button type="button">Open assistant</button>}
        tenantId="tenant-001"
        tenantRole="admin"
        userEmail="owner@tenant.test"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Governed tenant dashboard" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Customers").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Companies").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByPlaceholderText(/search/i).length
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Recent audit activity")).toBeInTheDocument();
    expect(screen.getByText("owner@tenant.test")).toBeInTheDocument();
  });

  it("renders governed fallback without breaking the rest of the dashboard", () => {
    render(
      <DashboardView
        activity={{ status: "forbidden" }}
        companies={{
          metadata: companyMetadata,
          state: createReadyState([
            { id: "company-1", name: "Acme Holdings", status: "active" },
          ]),
        }}
        context={createDashboardContext()}
        customers={{
          metadata: customerMetadata,
          state: {
            status: "forbidden",
          },
        }}
        tenantId="tenant-001"
        tenantRole="viewer"
        userEmail={null}
      />
    );

    expect(screen.getByText("Restricted")).toBeInTheDocument();
    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(screen.getAllByText("Companies").length).toBeGreaterThanOrEqual(1);
  });
});
