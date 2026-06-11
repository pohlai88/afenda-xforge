import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getAppOpenApiDocument } from "../app/api/openapi/_spec.ts";
import { GET } from "../app/api/openapi/route.ts";

const workspaceShortcutOperations = [
  {
    method: "get" as const,
    operationId: "getWorkspaceKeyboardShortcuts",
    path: "/api/me/keyboard-shortcuts",
  },
  {
    method: "post" as const,
    operationId: "updateWorkspaceKeyboardShortcuts",
    path: "/api/me/keyboard-shortcuts",
  },
  {
    method: "get" as const,
    operationId: "getTenantKeyboardShortcutPolicy",
    path: "/api/admin/tenant/keyboard-shortcuts",
  },
  {
    method: "post" as const,
    operationId: "updateTenantKeyboardShortcutPolicy",
    path: "/api/admin/tenant/keyboard-shortcuts",
  },
] as const;

const customerOperations = [
  {
    method: "get" as const,
    operationId: "listCustomers",
    path: "/api/customers",
  },
  {
    method: "post" as const,
    operationId: "createCustomer",
    path: "/api/customers",
  },
  {
    method: "patch" as const,
    operationId: "updateCustomer",
    path: "/api/customers/{customerId}",
  },
  {
    method: "delete" as const,
    operationId: "archiveCustomer",
    path: "/api/customers/{customerId}",
  },
] as const;

const companyOperations = [
  {
    method: "patch" as const,
    operationId: "updateCompany",
    path: "/api/companies/{companyId}",
  },
  {
    method: "delete" as const,
    operationId: "archiveCompany",
    path: "/api/companies/{companyId}",
  },
] as const;

describe("/api/openapi", () => {
  it("documents all workspace keyboard shortcut operations", () => {
    const document = getAppOpenApiDocument();

    for (const { path, method, operationId } of workspaceShortcutOperations) {
      const operation = document.paths[path]?.[method];

      expect(operation?.operationId).toBe(operationId);
      expect(operation?.tags).toContain("workspace-shortcuts");
    }
  });

  it("documents customer and company mutation operations", () => {
    const document = getAppOpenApiDocument();

    for (const { path, method, operationId } of customerOperations) {
      const operation = document.paths[path]?.[method];

      expect(operation?.operationId).toBe(operationId);
      expect(operation?.tags).toContain("customers");
    }

    for (const { path, method, operationId } of companyOperations) {
      const operation = document.paths[path]?.[method];

      expect(operation?.operationId).toBe(operationId);
      expect(operation?.tags).toContain("companies");
    }
  });

  it("serves the OpenAPI document over HTTP", async () => {
    const response = await GET(new Request("http://localhost/api/openapi"));
    const document = (await response.json()) as ReturnType<
      typeof getAppOpenApiDocument
    >;

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(document.paths["/api/me/keyboard-shortcuts"]?.get?.operationId).toBe(
      "getWorkspaceKeyboardShortcuts"
    );
  });
});
