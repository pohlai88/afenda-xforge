import assert from "node:assert/strict";
import test from "node:test";
import { createExecutionPipeline, createQueryPipeline } from "../index.ts";

test("query pipeline enforces ERP read order", async () => {
  const calls: string[] = [];
  const pipeline = createQueryPipeline<{ value: string }, string>({
    executeQuery: ({ input }) => {
      calls.push("executeQuery");
      return Promise.resolve(input.value);
    },
    permissionContext: () => {
      calls.push("permissionContext");
      return {
        action: "customers.list",
        actorId: "user-1",
        grantedPermissions: ["master-data.customers:read"],
        resource: "customers",
        tenantId: "tenant-1",
      };
    },
    permissionRequirement: {
      allOf: ["master-data.customers:read"],
    },
    requireAuth: () => {
      calls.push("requireAuth");
      return Promise.resolve({ actorId: "user-1" });
    },
    requirePermission: () => {
      calls.push("requirePermission");
    },
    requireTenantMembership: () => {
      calls.push("requireTenantMembership");
      return Promise.resolve();
    },
    resolveActiveTenant: () => {
      calls.push("resolveActiveTenant");
      return Promise.resolve({ tenantId: "tenant-1" });
    },
    validateInput: () => {
      calls.push("validateInput");
    },
  });

  assert.equal(await pipeline({ value: "ok" }), "ok");
  assert.deepEqual(calls, [
    "requireAuth",
    "resolveActiveTenant",
    "requireTenantMembership",
    "validateInput",
    "permissionContext",
    "requirePermission",
    "executeQuery",
  ]);
});

test("mutation pipeline writes audit before post-commit hooks", async () => {
  const calls: string[] = [];
  const pipeline = createExecutionPipeline<{ value: string }, string>({
    executeDomainOperation: ({ input }) => {
      calls.push("executeDomainOperation");
      return Promise.resolve({
        action: "customers.create",
        result: input.value,
        targetId: "customer-1",
        targetType: "customer",
      });
    },
    permissionContext: () => ({
      action: "customers.create",
      actorId: "user-1",
      grantedPermissions: ["master-data.customers:write"],
      resource: "customers",
      tenantId: "tenant-1",
    }),
    permissionRequirement: {
      allOf: ["master-data.customers:write"],
    },
    postCommitHooks: [
      () => {
        calls.push("postCommit");
      },
    ],
    requireAuth: () => Promise.resolve({ actorId: "user-1" }),
    requirePermission: async () => undefined,
    requireTenantMembership: async () => undefined,
    requestId: "request-1",
    resolveActiveTenant: () => Promise.resolve({ tenantId: "tenant-1" }),
    validateInput: () => undefined,
    writeAuditEvent: () => {
      calls.push("writeAuditEvent");
      return { id: "audit-1" };
    },
  });

  assert.equal(await pipeline({ value: "created" }), "created");
  assert.deepEqual(calls, [
    "executeDomainOperation",
    "writeAuditEvent",
    "postCommit",
  ]);
});
