import type { OpenApiDocument } from "./spec.ts";
import type { OpenApiJsonResponseOptions, SwaggerUiHtmlOptions } from "./ui.ts";
import { createOpenApiJsonResponse, createSwaggerUiResponse } from "./ui.ts";

type OpenApiDocumentSource =
  | OpenApiDocument
  | (() => OpenApiDocument | Promise<OpenApiDocument>);

export type OpenApiRouteOptions = OpenApiJsonResponseOptions;

export type SwaggerUiRouteOptions = Omit<SwaggerUiHtmlOptions, "specUrl"> & {
  specUrl: string;
};

const resolveDocument = async (
  source: OpenApiDocumentSource
): Promise<OpenApiDocument> =>
  typeof source === "function" ? await source() : source;

export const createOpenApiRoute = (
  source: OpenApiDocumentSource,
  options: OpenApiRouteOptions = {}
) =>
  async function GET(): Promise<Response> {
    return createOpenApiJsonResponse(await resolveDocument(source), options);
  };

export const createSwaggerUiRoute = (options: SwaggerUiRouteOptions) =>
  function GET(): Response {
    return createSwaggerUiResponse(options);
  };
