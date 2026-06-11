import "server-only";

import { InternalError, ValidationError } from "@repo/errors";
import type { RequestLoggingOptions } from "@repo/logger";
import { withRequestLogging } from "@repo/logger";
import type { z } from "zod";
import { ZodError } from "zod";
import type {
  AnyApiRouteContract,
  ApiBodySection,
  ApiRouteContext,
  ApiRouteRequest,
  ApiRouteResult,
} from "./contract.ts";
import { createApiSuccessResponse } from "./response.ts";

type RouteHandler<TContract extends AnyApiRouteContract> = (
  input: ApiRouteRequest<TContract>
) => Promise<ApiRouteResult<unknown>> | ApiRouteResult<unknown>;

export type ContractRouteOptions = RequestLoggingOptions;

const searchParamsToObject = (
  searchParams: URLSearchParams
): Record<string, string | string[]> => {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    const currentValue = result[key];

    if (typeof currentValue === "undefined") {
      result[key] = value;
      continue;
    }

    result[key] = Array.isArray(currentValue)
      ? [...currentValue, value]
      : [currentValue, value];
  }

  return result;
};

const parseBody = async (
  request: Request,
  bodyDefinition: ApiBodySection<z.ZodTypeAny> | undefined
): Promise<unknown> => {
  if (!bodyDefinition) {
    return;
  }

  const text = await request.text();

  if (text.length === 0) {
    return;
  }

  if ((bodyDefinition.parser ?? "json") === "text") {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ValidationError(
      {
        _root: ["Request body must be valid JSON"],
      },
      undefined,
      {
        cause: error,
      }
    );
  }
};

const validate = <T>(
  schema: { schema: { parse: (value: unknown) => T } } | undefined,
  value: unknown
): T | undefined => {
  if (!schema) {
    return;
  }

  try {
    return schema.schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw ValidationError.fromZodError(error);
    }

    throw error;
  }
};

const resolveParams = async (
  routeContext: ApiRouteContext
): Promise<Record<string, string | string[] | undefined>> =>
  (await routeContext.params) ?? {};

export const createContractRoute =
  <TContract extends AnyApiRouteContract>(
    contract: TContract,
    handler: RouteHandler<TContract>,
    options: ContractRouteOptions = {}
  ) =>
  async (
    request: Request,
    routeContext: ApiRouteContext = {}
  ): Promise<Response> => {
    const routeHandler = withRequestLogging(
      async (currentRequest, logger): Promise<Response> => {
        const url = new URL(currentRequest.url);
        const params = validate(
          contract.request?.params,
          await resolveParams(routeContext)
        );
        const query = validate(
          contract.request?.query,
          searchParamsToObject(url.searchParams)
        );
        const body = validate(
          contract.request?.body,
          await parseBody(currentRequest, contract.request?.body)
        );
        const result = await handler({
          request: currentRequest,
          logger,
          params,
          query,
          body,
          routeContext,
        } as ApiRouteRequest<TContract>);

        try {
          const data = contract.success.schema.parse(result.data);
          const responseHeaders = new Headers(result.headers ?? {});
          const resolvedContentType =
            responseHeaders.get("content-type") ??
            contract.success.contentType ??
            "application/json";

          if (resolvedContentType !== "application/json") {
            responseHeaders.set("content-type", resolvedContentType);

            return new Response(String(data), {
              headers: responseHeaders,
              status: result.status ?? contract.success.status,
            });
          }

          return createApiSuccessResponse(data, {
            headers: result.headers,
            meta: result.meta,
            status: result.status ?? contract.success.status,
          });
        } catch (error) {
          throw error instanceof ZodError
            ? new InternalError(
                "Route response does not match the declared API contract",
                error
              )
            : error;
        }
      },
      options
    );

    return await routeHandler(request);
  };
