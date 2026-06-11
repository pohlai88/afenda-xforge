import type { AppLogger } from "@repo/logger";
import type {
  OpenApiOperation,
  OpenApiResponse,
  OpenApiSchemaObject,
} from "@repo/openapi";
import type { z } from "zod";

export type ApiMethod =
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT";

export type ApiAudience = "client" | "internal" | "operational";

export type ApiSchemaSection<TSchema extends z.ZodTypeAny> = {
  openApiSchema: OpenApiSchemaObject;
  schema: TSchema;
};

export type ApiBodySection<TSchema extends z.ZodTypeAny> =
  ApiSchemaSection<TSchema> & {
    contentType?: string;
    description?: string;
    parser?: "json" | "text";
    required?: boolean;
  };

export type ApiRequestContract<
  TParams extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
> = {
  body?: TBody extends z.ZodTypeAny ? ApiBodySection<TBody> : never;
  params?: TParams extends z.ZodTypeAny ? ApiSchemaSection<TParams> : never;
  query?: TQuery extends z.ZodTypeAny ? ApiSchemaSection<TQuery> : never;
};

export type ApiSuccessContract<TResponse extends z.ZodTypeAny> = {
  contentType?: string;
  description: string;
  openApiSchema: OpenApiSchemaObject;
  schema: TResponse;
  status: number;
};

export type ApiRouteContract<
  TParams extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
> = {
  audience?: ApiAudience;
  deprecated?: boolean;
  description?: string;
  errors?: Record<string, OpenApiResponse>;
  method: ApiMethod;
  operationId: string;
  path: string;
  request?: ApiRequestContract<TParams, TQuery, TBody>;
  responses?: Pick<OpenApiOperation, "security">;
  success: ApiSuccessContract<TResponse>;
  summary: string;
  tags?: string[];
};

export type AnyApiRouteContract = ApiRouteContract<
  z.ZodTypeAny | undefined,
  z.ZodTypeAny | undefined,
  z.ZodTypeAny | undefined,
  z.ZodTypeAny
>;

type InferSection<TSection> = TSection extends { schema: infer TSchema }
  ? TSchema extends z.ZodTypeAny
    ? z.infer<TSchema>
    : never
  : undefined;

type ContractParams<TContract extends AnyApiRouteContract> =
  TContract extends ApiRouteContract<infer TParams, infer _TQuery, infer _TBody, infer _TResponse>
    ? TParams extends z.ZodTypeAny
      ? z.infer<TParams>
      : undefined
    : undefined;

type ContractQuery<TContract extends AnyApiRouteContract> =
  TContract extends ApiRouteContract<infer _TParams, infer TQuery, infer _TBody, infer _TResponse>
    ? TQuery extends z.ZodTypeAny
      ? z.infer<TQuery>
      : undefined
    : undefined;

type ContractBody<TContract extends AnyApiRouteContract> =
  TContract extends ApiRouteContract<infer _TParams, infer _TQuery, infer TBody, infer _TResponse>
    ? TBody extends z.ZodTypeAny
      ? z.infer<TBody>
      : undefined
    : undefined;

export type ApiRouteContextParams = Record<
  string,
  string | string[] | undefined
>;

export type ApiRouteContext = {
  params?: ApiRouteContextParams | Promise<ApiRouteContextParams>;
};

export type ApiRouteRequest<TContract extends AnyApiRouteContract> = {
  body: ContractBody<TContract>;
  logger: AppLogger;
  params: ContractParams<TContract>;
  query: ContractQuery<TContract>;
  request: Request;
  routeContext: ApiRouteContext;
};

export type ApiRouteResult<TData> = {
  data: TData;
  headers?: Headers | [string, string][] | Record<string, string>;
  meta?: Record<string, unknown>;
  status?: number;
};

export const defineRouteContract = <
  TParams extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
>(
  contract: ApiRouteContract<TParams, TQuery, TBody, TResponse>
): ApiRouteContract<TParams, TQuery, TBody, TResponse> => contract;
