import { describe, expect, it } from "vitest";
import {
  WORKSPACE_APP_NAVIGATION_SURFACES,
  WORKSPACE_APP_ROUTE_EXEMPTIONS,
  WORKSPACE_APP_SIDEBAR_NAV_GROUPS,
} from "../app/_components/workspace/workspace-app-surfaces.ts";

describe("declared app surface catalog", () => {
  it("renders visible product surfaces through sidebar groups, not only five compact rows", () => {
    const sidebarHrefs = WORKSPACE_APP_SIDEBAR_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.href)
    );

    expect(sidebarHrefs).toContain("/dashboard");
    expect(sidebarHrefs).toContain("/infrastructure/integration");
    expect(sidebarHrefs).toContain("/audit");
    expect(sidebarHrefs).toContain("/admin/branding");
    expect(sidebarHrefs.length).toBeGreaterThan(5);
  });

  it("classifies Audit as a human governance and risk review surface", () => {
    const auditSurface = WORKSPACE_APP_NAVIGATION_SURFACES.find(
      (surface) => surface.href === "/audit"
    );

    expect(auditSurface).toMatchObject({
      group: "Governance",
      label: "Audit",
    });
    expect(auditSurface?.description).toContain("risk");
    expect(auditSurface?.description).toContain("leakage");
    expect(auditSurface?.description).toContain("evidence");
  });

  it("places the HR overview inside Documents Management", () => {
    const documentsSurface = WORKSPACE_APP_NAVIGATION_SURFACES.find(
      (surface) => surface.href === "/hr/documents"
    );
    const overviewSurface = WORKSPACE_APP_NAVIGATION_SURFACES.find(
      (surface) => surface.href === "/hr"
    );
    const hrSidebarGroup = WORKSPACE_APP_SIDEBAR_NAV_GROUPS.find(
      (group) => group.label === "HR"
    );

    expect(documentsSurface?.featureId).toBe(
      "hr-suite.employee-management.documents-management"
    );
    expect(documentsSurface?.label).toBe("Documents Management");
    expect(overviewSurface?.featureId).toBe(
      "hr-suite.employee-management.documents-management"
    );
    expect(overviewSurface?.label).toBe("Overview");
    expect(hrSidebarGroup?.items).toHaveLength(1);
    expect(hrSidebarGroup?.items[0]?.label).toBe("Documents Management");
    expect(hrSidebarGroup?.items[0]?.children?.[0]?.label).toBe("Overview");
  });

  it("marks scaffold app surfaces so the live sidebar can render inert rows", () => {
    expect(
      WORKSPACE_APP_NAVIGATION_SURFACES.find(
        (surface) => surface.href === "/infrastructure/lynx"
      )
    ).toMatchObject({ availability: "scaffold" });
    expect(
      WORKSPACE_APP_NAVIGATION_SURFACES.find(
        (surface) => surface.href === "/orbit"
      )
    ).toMatchObject({ availability: "scaffold" });
  });

  it("keeps hidden routes explicit instead of silently omitting them", () => {
    expect(WORKSPACE_APP_ROUTE_EXEMPTIONS).toContainEqual({
      href: "/hr/documents/[documentId]",
      reason: "detail-route",
    });
  });
});
