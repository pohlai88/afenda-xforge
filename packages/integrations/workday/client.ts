import "server-only";

import { loadWorkdayKeys } from "./keys.ts";
import type { WorkdayRequestOptions, WorkdayTokenResponse } from "./types.ts";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

export const getWorkdayAccessToken = async (): Promise<string> => {
  const {
    WORKDAY_ACCESS_TOKEN,
    WORKDAY_CLIENT_ID,
    WORKDAY_CLIENT_SECRET,
    WORKDAY_SCOPE,
    WORKDAY_TOKEN_URL,
  } = loadWorkdayKeys();

  if (WORKDAY_ACCESS_TOKEN) {
    return WORKDAY_ACCESS_TOKEN;
  }

  if (!(WORKDAY_TOKEN_URL && WORKDAY_CLIENT_ID && WORKDAY_CLIENT_SECRET)) {
    throw new Error(
      "Workday credentials are not fully configured. Set WORKDAY_ACCESS_TOKEN or the OAuth client credentials."
    );
  }

  const form = new URLSearchParams({
    grant_type: "client_credentials",
  });

  if (WORKDAY_SCOPE) {
    form.set("scope", WORKDAY_SCOPE);
  }

  const basicAuth = Buffer.from(
    `${WORKDAY_CLIENT_ID}:${WORKDAY_CLIENT_SECRET}`,
    "utf8"
  ).toString("base64");

  const response = await fetch(WORKDAY_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: `Basic ${basicAuth}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const payload = (await response.json()) as WorkdayTokenResponse;

  if (!(response.ok && payload.access_token)) {
    throw new Error(
      `Workday token request failed with status ${response.status}`
    );
  }

  return payload.access_token;
};

export const workdayRequest = async <TResponse>({
  accessToken,
  body,
  headers,
  method = "GET",
  path,
  signal,
}: WorkdayRequestOptions): Promise<TResponse> => {
  const { WORKDAY_API_BASE_URL } = loadWorkdayKeys();

  if (!WORKDAY_API_BASE_URL) {
    throw new Error("WORKDAY_API_BASE_URL is not set");
  }

  const token = accessToken ?? (await getWorkdayAccessToken());
  const normalizedBaseUrl = trimTrailingSlash(WORKDAY_API_BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${normalizedBaseUrl}${normalizedPath}`, {
    method,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      ...headers,
    },
    body,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Workday request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
};
