export type WorkdayKeys = {
  readonly WORKDAY_ACCESS_TOKEN?: string;
  readonly WORKDAY_API_BASE_URL?: string;
  readonly WORKDAY_CLIENT_ID?: string;
  readonly WORKDAY_CLIENT_SECRET?: string;
  readonly WORKDAY_SCOPE?: string;
  readonly WORKDAY_TOKEN_URL?: string;
};

export type WorkdayTokenResponse = {
  access_token: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export type WorkdayRequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: BodyInit | null;
  headers?: HeadersInit;
  accessToken?: string;
  signal?: AbortSignal;
};
