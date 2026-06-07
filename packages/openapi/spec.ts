export type OpenApiSchemaObject = Record<string, unknown>;

export type OpenApiComponentMap = Record<string, OpenApiSchemaObject>;

export type OpenApiServer = {
  url: string;
  description?: string;
};

export type OpenApiContact = {
  email?: string;
  name?: string;
  url?: string;
};

export type OpenApiInfo = {
  title: string;
  version: string;
  description?: string;
  summary?: string;
  termsOfService?: string;
  contact?: OpenApiContact;
};

export type OpenApiTag = {
  name: string;
  description?: string;
};

export type OpenApiMediaTypeObject = {
  schema?: OpenApiSchemaObject;
  examples?: Record<string, unknown>;
  example?: unknown;
};

export type OpenApiParameter = {
  name: string;
  in: "cookie" | "header" | "path" | "query";
  description?: string;
  required?: boolean;
  schema?: OpenApiSchemaObject;
};

export type OpenApiRequestBody = {
  description?: string;
  required?: boolean;
  content: Record<string, OpenApiMediaTypeObject>;
};

export type OpenApiResponse = {
  description: string;
  content?: Record<string, OpenApiMediaTypeObject>;
  headers?: Record<string, OpenApiSchemaObject>;
};

export type OpenApiSecurityScheme = {
  type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "cookie" | "header" | "query";
  scheme?: string;
  bearerFormat?: string;
  openIdConnectUrl?: string;
  flows?: Record<string, unknown>;
};

export type OpenApiOperation = {
  summary: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
  deprecated?: boolean;
  security?: Record<string, string[]>[];
};

export type OpenApiPathItem = Partial<
  Record<
    "delete" | "get" | "head" | "options" | "patch" | "post" | "put",
    OpenApiOperation
  >
>;

export type OpenApiDocument = {
  openapi: "3.1.0";
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: OpenApiComponentMap;
    securitySchemes?: Record<string, OpenApiSecurityScheme>;
  };
  tags?: OpenApiTag[];
};

export type CreateOpenApiDocumentOptions = {
  info: OpenApiInfo;
  servers?: OpenApiServer[];
};

export const createOpenApiDocument = (
  options: CreateOpenApiDocumentOptions
): OpenApiDocument => ({
  openapi: "3.1.0",
  info: options.info,
  paths: {},
  components: {
    schemas: {},
    securitySchemes: {},
  },
  tags: [],
  servers: options.servers?.length ? [...options.servers] : undefined,
});

export const addOperation = (
  document: OpenApiDocument,
  path: string,
  method: keyof OpenApiPathItem,
  operation: OpenApiOperation
): void => {
  document.paths[path] ??= {};
  document.paths[path][method] = operation;
};

export const addSchema = (
  document: OpenApiDocument,
  name: string,
  schema: OpenApiSchemaObject
): void => {
  document.components ??= {};
  document.components.schemas ??= {};
  document.components.schemas[name] = schema;
};

export const addSecurityScheme = (
  document: OpenApiDocument,
  name: string,
  securityScheme: OpenApiSecurityScheme
): void => {
  document.components ??= {};
  document.components.securitySchemes ??= {};
  document.components.securitySchemes[name] = securityScheme;
};

export const addTag = (document: OpenApiDocument, tag: OpenApiTag): void => {
  document.tags ??= [];

  if (document.tags.some((currentTag) => currentTag.name === tag.name)) {
    return;
  }

  document.tags.push(tag);
};
