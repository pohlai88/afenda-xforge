import { defineRouteContract } from "@repo/api";
import { systemAdminMutationResultSchema } from "../../schema.ts";
import { roleAssignmentCommandSchema } from "./schema.ts";

export const accessCapabilities = {
  usersAccessRead: "system-admin.users-access.read",
  usersAccessWrite: "system-admin.users-access.write",
} as const;

export const systemAdminAssignRoleRouteContract = defineRouteContract({
  audience: "client",
  method: "POST",
  operationId: "assignSystemAdminRole",
  path: "/api/system-admin/users/roles",
  request: {
    body: {
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          reason: { type: "string" },
          roleKey: { type: "string" },
          targetUserId: { type: "string" },
        },
        required: ["reason", "roleKey", "targetUserId"],
      },
      schema: roleAssignmentCommandSchema,
    },
  },
  success: {
    description: "Accepted role assignment",
    openApiSchema: {
      $ref: "#/components/schemas/SystemAdminMutationResult",
    },
    schema: systemAdminMutationResultSchema,
    status: 202,
  },
  summary: "Assign governed tenant role",
  tags: ["system-admin"],
});

export const accessRouteContracts = [
  systemAdminAssignRoleRouteContract,
] as const;
