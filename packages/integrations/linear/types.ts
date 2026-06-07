export type LinearGraphQLError = {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

export type LinearGraphQLResponse<TData> = {
  data?: TData;
  errors?: LinearGraphQLError[];
};

export type LinearGraphQLRequest<TVariables = Record<string, unknown>> = {
  query: string;
  variables?: TVariables;
};

export type LinearRequestOptions<TVariables = Record<string, unknown>> =
  LinearGraphQLRequest<TVariables> & {
    accessToken?: string;
    signal?: AbortSignal;
  };

export type LinearWebhookVerificationInput = {
  rawBody: string | Uint8Array;
  signature: string | null | undefined;
  secret: string;
  webhookTimestamp?: number;
  now?: number;
  maxSkewMs?: number;
};
