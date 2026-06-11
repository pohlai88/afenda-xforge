import type { OpenApiDocument, OpenApiSchemaObject } from "@repo/openapi";
import { addOperation, addSchema, addTag } from "@repo/openapi";

const shortcutActionIdSchema: OpenApiSchemaObject = {
  type: "string",
  enum: [
    "workspace.commandSearch",
    "workspace.openShortcutHelp",
    "workspace.toggleSidebar",
    "crud.create",
    "crud.edit",
    "crud.save",
    "crud.delete",
    "crud.cancel",
  ],
};

const shortcutBindingSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    key: { type: "string" },
    label: { type: "string" },
    normalized: { type: "string" },
  },
  required: ["key", "label", "normalized"],
};

const resolvedShortcutSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    actionId: { $ref: "#/components/schemas/WorkspaceShortcutActionId" },
    binding: { $ref: "#/components/schemas/WorkspaceShortcutBinding" },
    secondaryBinding: { $ref: "#/components/schemas/WorkspaceShortcutBinding" },
    browserConflict: { type: "boolean" },
    description: { type: "string" },
    group: {
      type: "string",
      enum: ["navigation", "crud", "help"],
    },
    locked: { type: "boolean" },
    reliability: {
      type: "string",
      enum: ["high", "medium", "low"],
    },
    scope: {
      type: "string",
      enum: ["global", "workspace", "crud", "grid", "dialog"],
    },
    source: {
      type: "string",
      enum: ["product", "tenant", "user"],
    },
  },
  required: [
    "actionId",
    "binding",
    "description",
    "group",
    "locked",
    "reliability",
    "scope",
    "source",
  ],
};

const shortcutPolicySchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    allowFnKeyBindings: { type: "boolean" },
    allowUserCustomize: { type: "boolean" },
    lockedActions: {
      type: "array",
      items: { $ref: "#/components/schemas/WorkspaceShortcutActionId" },
    },
  },
  required: ["allowFnKeyBindings", "allowUserCustomize", "lockedActions"],
};

const shortcutOverridesSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: {
    type: "string",
  },
};

const workspaceShortcutsPayloadSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    bindings: {
      type: "object",
      additionalProperties: {
        $ref: "#/components/schemas/WorkspaceResolvedShortcut",
      },
    },
    layers: {
      type: "object",
      additionalProperties: false,
      properties: {
        tenant: { $ref: "#/components/schemas/WorkspaceShortcutOverrides" },
        user: { $ref: "#/components/schemas/WorkspaceShortcutOverrides" },
      },
      required: ["tenant", "user"],
    },
    policy: { $ref: "#/components/schemas/WorkspaceShortcutPolicy" },
    source: {
      type: "object",
      additionalProperties: {
        type: "string",
        enum: ["product", "tenant", "user"],
      },
    },
  },
  required: ["bindings", "layers", "policy", "source"],
};

const tenantKeyboardShortcutPolicySnapshotSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    allowFnKeyBindings: { type: "boolean" },
    allowUserCustomize: { type: "boolean" },
    lockedActions: {
      type: "array",
      items: { $ref: "#/components/schemas/WorkspaceShortcutActionId" },
    },
    overrides: { $ref: "#/components/schemas/WorkspaceShortcutOverrides" },
  },
  required: [
    "allowFnKeyBindings",
    "allowUserCustomize",
    "lockedActions",
    "overrides",
  ],
};

const tenantKeyboardShortcutPolicyPayloadSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    policy: {
      $ref: "#/components/schemas/TenantKeyboardShortcutPolicySnapshot",
    },
    preview: { $ref: "#/components/schemas/WorkspaceShortcutsPayload" },
  },
  required: ["policy", "preview"],
};

const userShortcutOverridesPostSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    overrides: {
      type: "object",
      additionalProperties: {
        oneOf: [{ type: "string" }, { type: "null" }],
      },
    },
  },
  required: ["overrides"],
};

const tenantKeyboardShortcutPolicyPostSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    allowFnKeyBindings: { type: "boolean" },
    allowUserCustomize: { type: "boolean" },
    lockedActions: {
      type: "array",
      items: { $ref: "#/components/schemas/WorkspaceShortcutActionId" },
    },
    overrides: {
      type: "object",
      additionalProperties: {
        oneOf: [{ type: "string" }, { type: "null" }],
      },
    },
  },
};

const errorResponseSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    error: { type: "string" },
  },
  required: ["error"],
};

const userShortcutUpdateResponseSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    payload: { $ref: "#/components/schemas/WorkspaceShortcutsPayload" },
  },
  required: ["payload"],
};

export const registerWorkspaceShortcutsOpenApi = (
  document: OpenApiDocument
): void => {
  addTag(document, {
    name: "workspace-shortcuts",
    description:
      "Server-resolved workspace keyboard shortcut bindings and tenant policy",
  });

  addSchema(document, "WorkspaceShortcutActionId", shortcutActionIdSchema);
  addSchema(document, "WorkspaceShortcutBinding", shortcutBindingSchema);
  addSchema(document, "WorkspaceResolvedShortcut", resolvedShortcutSchema);
  addSchema(document, "WorkspaceShortcutPolicy", shortcutPolicySchema);
  addSchema(document, "WorkspaceShortcutOverrides", shortcutOverridesSchema);
  addSchema(
    document,
    "WorkspaceShortcutsPayload",
    workspaceShortcutsPayloadSchema
  );
  addSchema(
    document,
    "TenantKeyboardShortcutPolicySnapshot",
    tenantKeyboardShortcutPolicySnapshotSchema
  );
  addSchema(
    document,
    "TenantKeyboardShortcutPolicyPayload",
    tenantKeyboardShortcutPolicyPayloadSchema
  );
  addSchema(
    document,
    "UserShortcutOverridesPost",
    userShortcutOverridesPostSchema
  );
  addSchema(
    document,
    "TenantKeyboardShortcutPolicyPost",
    tenantKeyboardShortcutPolicyPostSchema
  );
  addSchema(
    document,
    "UserShortcutUpdateResponse",
    userShortcutUpdateResponseSchema
  );
  addSchema(document, "WorkspaceShortcutErrorResponse", errorResponseSchema);

  addOperation(document, "/api/me/keyboard-shortcuts", "get", {
    summary: "Resolve workspace keyboard shortcuts for the active user",
    description:
      "Returns merged product, tenant, and user keyboard shortcut bindings for the authenticated tenant membership.",
    operationId: "getWorkspaceKeyboardShortcuts",
    tags: ["workspace-shortcuts"],
    responses: {
      "200": {
        description: "Resolved keyboard shortcut payload",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutsPayload",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/me/keyboard-shortcuts", "post", {
    summary: "Update personal keyboard shortcut overrides",
    description:
      "Persists user-level keyboard shortcut overrides when tenant policy allows customization.",
    operationId: "updateWorkspaceKeyboardShortcuts",
    tags: ["workspace-shortcuts"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UserShortcutOverridesPost",
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Updated keyboard shortcut payload",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UserShortcutUpdateResponse",
            },
          },
        },
      },
      "400": {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutErrorResponse",
            },
          },
        },
      },
      "403": {
        description: "Customization disabled by tenant policy",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutErrorResponse",
            },
          },
        },
      },
      "422": {
        description:
          "Business rule violation (reserved keys, collisions, policy locks)",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutErrorResponse",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/admin/tenant/keyboard-shortcuts", "get", {
    summary: "Read tenant keyboard shortcut policy",
    description:
      "Returns tenant keyboard shortcut policy and a preview of effective bindings.",
    operationId: "getTenantKeyboardShortcutPolicy",
    tags: ["workspace-shortcuts"],
    responses: {
      "200": {
        description: "Tenant keyboard shortcut policy payload",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TenantKeyboardShortcutPolicyPayload",
            },
          },
        },
      },
      "403": {
        description: "Missing tenant settings read permission",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutErrorResponse",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/admin/tenant/keyboard-shortcuts", "post", {
    summary: "Update tenant keyboard shortcut policy",
    description:
      "Updates tenant-level keyboard shortcut policy, locked actions, and organization overrides.",
    operationId: "updateTenantKeyboardShortcutPolicy",
    tags: ["workspace-shortcuts"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/TenantKeyboardShortcutPolicyPost",
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Updated tenant keyboard shortcut policy payload",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TenantKeyboardShortcutPolicyPayload",
            },
          },
        },
      },
      "400": {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutErrorResponse",
            },
          },
        },
      },
      "403": {
        description: "Missing tenant settings write permission",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/WorkspaceShortcutErrorResponse",
            },
          },
        },
      },
    },
  });
};
