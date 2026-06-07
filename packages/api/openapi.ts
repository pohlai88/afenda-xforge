import type {
  OpenApiDocument,
  OpenApiParameter,
  OpenApiResponse,
  OpenApiSchemaObject,
} from "@repo/openapi";
import { addOperation, addSchema, addTag } from "@repo/openapi";
import type { AnyApiRouteContract } from "./contract.ts";

export const apiErrorOpenApiSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    success: {
      type: "boolean",
      const: false,
    },
    error: {
      type: "object",
      additionalProperties: false,
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        statusCode: { type: "number" },
        details: {
          type: "object",
          additionalProperties: true,
        },
        requestId: { type: "string" },
        timestamp: {
          type: "string",
          format: "date-time",
        },
      },
      required: ["code", "message", "statusCode", "timestamp"],
    },
  },
  required: ["success", "error"],
};

const defaultErrorResponses: Record<string, OpenApiResponse> = {
  "401": {
    description: "Authentication is required",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema,
      },
    },
  },
  "403": {
    description: "The caller is not allowed to perform this action",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema,
      },
    },
  },
  "422": {
    description: "The request payload is invalid",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema,
      },
    },
  },
  "500": {
    description: "An internal server error occurred",
    content: {
      "application/json": {
        schema: apiErrorOpenApiSchema,
      },
    },
  },
};

export const createSuccessEnvelopeOpenApiSchema = (
  dataSchema: OpenApiSchemaObject
): OpenApiSchemaObject => ({
  type: "object",
  additionalProperties: false,
  properties: {
    success: {
      type: "boolean",
      const: true,
    },
    data: dataSchema,
    meta: {
      type: "object",
      additionalProperties: true,
    },
  },
  required: ["success", "data"],
});

const toParameters = (
  location: "path" | "query",
  schema: OpenApiSchemaObject | undefined
): OpenApiParameter[] => {
  if (
    schema?.type !== "object" ||
    typeof schema.properties !== "object" ||
    schema.properties === null
  ) {
    return [];
  }

  const requiredFields = Array.isArray(schema.required)
    ? new Set(
        schema.required.filter(
          (value): value is string => typeof value === "string"
        )
      )
    : new Set<string>();
  const properties = Object.entries(
    schema.properties as Record<string, unknown>
  );

  return properties.map(([name, propertySchema]) => ({
    name,
    in: location,
    required: location === "path" ? true : requiredFields.has(name),
    schema: (propertySchema ?? {}) as OpenApiSchemaObject,
  }));
};

export const addRouteContractToOpenApi = (
  document: OpenApiDocument,
  contract: AnyApiRouteContract
): void => {
  for (const tag of contract.tags ?? []) {
    addTag(document, { name: tag });
  }

  const parameters = [
    ...toParameters("path", contract.request?.params?.openApiSchema),
    ...toParameters("query", contract.request?.query?.openApiSchema),
  ];

  addOperation(
    document,
    contract.path,
    contract.method.toLowerCase() as Lowercase<typeof contract.method>,
    {
      summary: contract.summary,
      description: contract.description,
      operationId: contract.operationId,
      tags: contract.tags,
      parameters: parameters.length ? parameters : undefined,
      requestBody: contract.request?.body
        ? {
            description: contract.request.body.description,
            required: contract.request.body.required ?? true,
            content: {
              [contract.request.body.contentType ?? "application/json"]: {
                schema: contract.request.body.openApiSchema,
              },
            },
          }
        : undefined,
      responses: {
        [String(contract.success.status)]: {
          description: contract.success.description,
          content: {
            [contract.success.contentType ?? "application/json"]: {
              schema: createSuccessEnvelopeOpenApiSchema(
                contract.success.openApiSchema
              ),
            },
          },
        },
        ...defaultErrorResponses,
        ...contract.errors,
      },
      deprecated: contract.deprecated,
      security: contract.responses?.security,
    }
  );
};

export const addRouteContractsToOpenApi = (
  document: OpenApiDocument,
  contracts: readonly AnyApiRouteContract[]
): void => {
  for (const contract of contracts) {
    addRouteContractToOpenApi(document, contract);
  }
};

export const addSchemasToOpenApi = (
  document: OpenApiDocument,
  schemas: Record<string, OpenApiSchemaObject>
): void => {
  for (const [name, schema] of Object.entries(schemas)) {
    addSchema(document, name, schema);
  }
};
