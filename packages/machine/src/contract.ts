import { aiHttpRoutes } from "@repo/ai/ai-http.contract";
import type { OpenApiDocument } from "@repo/api";
import {
  addRouteContractsToOpenApi,
  addSchemasToOpenApi,
  defineRouteContract,
} from "@repo/api";
import { z } from "zod";
import { xforgeAiModules } from "./types.ts";

export const xforgeAiModuleSchema = z.enum(xforgeAiModules);

export const xforgeChatRoleSchema = z.enum(["system", "user", "assistant"]);

export const xforgeChatMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  role: xforgeChatRoleSchema,
});

export const machineAssistantRequestSchema = z.object({
  history: z.array(xforgeChatMessageSchema).max(20).default([]),
  message: z.string().trim().min(1).max(4000),
  module: xforgeAiModuleSchema.optional(),
});

export const machineAssistantResponseSchema = z.object({
  assistant: z.string().min(1).max(160),
  intentConfidence: z.number().min(0).max(1),
  module: xforgeAiModuleSchema,
  response: z.string().min(1),
});

export type MachineAssistantRequest = z.infer<
  typeof machineAssistantRequestSchema
>;
export type MachineAssistantResponse = z.infer<
  typeof machineAssistantResponseSchema
>;
export type XforgeChatMessage = z.infer<typeof xforgeChatMessageSchema>;

export const machineAssistantRouteContract = defineRouteContract<
  undefined,
  undefined,
  typeof machineAssistantRequestSchema,
  typeof machineAssistantResponseSchema
>({
  audience: "internal",
  description:
    "Generates a tenant-scoped assistant response using the XForge machine layer.",
  method: "POST",
  operationId: "machineAssistantChat",
  path: aiHttpRoutes.assistant,
  request: {
    body: {
      schema: machineAssistantRequestSchema,
      openApiSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          history: {
            type: "array",
            maxItems: 20,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                content: { type: "string", minLength: 1, maxLength: 4000 },
                role: {
                  type: "string",
                  enum: ["system", "user", "assistant"],
                },
              },
              required: ["content", "role"],
            },
            default: [],
          },
          message: {
            type: "string",
            minLength: 1,
            maxLength: 4000,
          },
          module: {
            type: "string",
            enum: [...xforgeAiModules],
          },
        },
        required: ["message"],
      },
    },
  },
  success: {
    description: "Machine assistant response",
    openApiSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        assistant: {
          type: "string",
        },
        intentConfidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
        module: {
          type: "string",
          enum: [...xforgeAiModules],
        },
        response: {
          type: "string",
        },
      },
      required: ["assistant", "intentConfidence", "module", "response"],
    },
    schema: machineAssistantResponseSchema,
    status: 200,
  },
  summary: "Ask the machine assistant",
  tags: ["ai"],
});

export const machineOpenApiSchemas = {
  MachineAssistantRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      history: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            content: { type: "string", minLength: 1, maxLength: 4000 },
            role: {
              type: "string",
              enum: ["system", "user", "assistant"],
            },
          },
          required: ["content", "role"],
        },
      },
      message: {
        type: "string",
        minLength: 1,
        maxLength: 4000,
      },
      module: {
        type: "string",
        enum: [...xforgeAiModules],
      },
    },
    required: ["message"],
  },
  MachineAssistantResponse: {
    type: "object",
    additionalProperties: false,
    properties: {
      assistant: {
        type: "string",
      },
      intentConfidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      module: {
        type: "string",
        enum: [...xforgeAiModules],
      },
      response: {
        type: "string",
      },
    },
    required: ["assistant", "intentConfidence", "module", "response"],
  },
  XforgeChatMessage: {
    type: "object",
    additionalProperties: false,
    properties: {
      content: { type: "string", minLength: 1, maxLength: 4000 },
      role: {
        type: "string",
        enum: ["system", "user", "assistant"],
      },
    },
    required: ["content", "role"],
  },
} as const;

export const registerMachineOpenApi = (document: OpenApiDocument): void => {
  addSchemasToOpenApi(document, machineOpenApiSchemas);
  addRouteContractsToOpenApi(document, [machineAssistantRouteContract]);
};
