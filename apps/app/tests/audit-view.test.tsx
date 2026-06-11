import { auditEventMetadata } from "@repo/features-system-admin-control-plane/metadata/audit-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { AuditView } from "../app/(authenticated)/audit/audit-view.tsx";

const createAuditContext = () =>
  createAppMetadataContext({
    featureId: "system-admin.audit",
    permissions: ["system-admin.audit.read"],
    tenantId: "tenant-001",
    userId: "user-001",
  });

describe("AuditView", () => {
  it("renders the governed audit consumer with EntityMetadataPanel", () => {
    render(
      <AuditView
        context={createAuditContext()}
        data={{
          actorId: "user-001",
          events: [
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
          ],
          grantedPermissions: ["system-admin.audit.read"],
          latestEvent: {
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
            policyReference: "policy/customer-create",
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
          tenantId: "tenant-001",
          tenantRole: "admin",
          total: 1,
          userEmail: "owner@tenant.test",
        }}
        metadata={auditEventMetadata}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Audit trail" })
    ).toBeInTheDocument();
    expect(screen.getByText("Event ledger")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search audit trail...")
    ).toBeInTheDocument();
    expect(screen.getByText("Activity preview")).toBeInTheDocument();
    expect(screen.getByText("Latest event workflow")).toBeInTheDocument();
    expect(screen.getByText("Approval preview")).toBeInTheDocument();
    expect(screen.getAllByText("Customer created").length).toBeGreaterThan(0);
  });

  it("renders forbidden shell state from the page boundary contract", () => {
    render(
      <AuditView
        context={createAuditContext()}
        data={{
          actorId: "user-001",
          events: [],
          grantedPermissions: [],
          latestEvent: null,
          tenantId: "tenant-001",
          tenantRole: "viewer",
          total: 0,
          userEmail: null,
        }}
        metadata={auditEventMetadata}
      />
    );

    expect(screen.getByText("No audit events")).toBeInTheDocument();
  });
});
