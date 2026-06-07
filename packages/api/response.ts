type ResponseHeaders = Headers | [string, string][] | Record<string, string>;

export type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  meta?: Record<string, unknown>;
};

export type CreateApiSuccessResponseOptions = {
  headers?: ResponseHeaders;
  meta?: Record<string, unknown>;
  status?: number;
};

export const createApiSuccessResponse = <TData>(
  data: TData,
  options: CreateApiSuccessResponseOptions = {}
): Response => {
  const headers = new Headers(options.headers);

  headers.set("content-type", "application/json");

  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...(options.meta ? { meta: options.meta } : {}),
    } satisfies ApiSuccessResponse<TData>),
    {
      status: options.status ?? 200,
      headers,
    }
  );
};
