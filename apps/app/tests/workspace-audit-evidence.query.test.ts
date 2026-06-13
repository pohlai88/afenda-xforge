import { describe, expect, it } from "vitest";
import { buildWorkspaceAuditEvidenceQuery } from "../app/_components/workspace/audit-evidence/workspace-audit-evidence.query.ts";
import { buildWorkspaceAuditEvidenceScopeFromFeature } from "../app/_components/workspace/audit-evidence/workspace-audit-evidence-scope.ts";

describe("buildWorkspaceAuditEvidenceQuery", () => {
  it("maps scope fields to audit list query params", () => {
    const params = buildWorkspaceAuditEvidenceQuery(
      {
        module: "hr-suite.employee-management.documents-management",
        route: "/hr/documents",
        surface: "site-content",
        targetId: "doc-1",
        targetType: "hr.document",
      },
      { limit: 10, offset: 5 }
    );

    expect(params.get("module")).toBe(
      "hr-suite.employee-management.documents-management"
    );
    expect(params.get("route")).toBe("/hr/documents");
    expect(params.get("surface")).toBe("site-content");
    expect(params.get("targetId")).toBe("doc-1");
    expect(params.get("targetType")).toBe("hr.document");
    expect(params.get("limit")).toBe("10");
    expect(params.get("offset")).toBe("5");
  });

  it("omits empty scope values and applies defaults", () => {
    const params = buildWorkspaceAuditEvidenceQuery({});

    expect(params.get("module")).toBeNull();
    expect(params.get("limit")).toBe("20");
    expect(params.get("offset")).toBe("0");
  });
});

describe("buildWorkspaceAuditEvidenceScopeFromFeature", () => {
  it("maps HR feature metadata to audit scope", () => {
    expect(
      buildWorkspaceAuditEvidenceScopeFromFeature({
        featureId: "hr-suite.employee-management.documents-management",
        liveHref: "/hr/documents",
      })
    ).toEqual({
      module: "hr-suite.employee-management.documents-management",
      route: "/hr/documents",
      surface: "site-content",
    });
  });
});
