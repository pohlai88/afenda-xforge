import "server-only";

import { loadLinearKeys } from "./keys.js";
import type { LinearGraphQLResponse, LinearRequestOptions } from "./types.js";

const resolveAuthorizationHeader = (accessToken?: string): string => {
  const { LINEAR_API_KEY } = loadLinearKeys();
  const token = accessToken ?? LINEAR_API_KEY;

  if (!token) {
    throw new Error("LINEAR_API_KEY is not set");
  }

  if (token.startsWith("Bearer ")) {
    return token;
  }

  return accessToken ? `Bearer ${token}` : token;
};

export const linearGraphqlRequest = async <
  TData,
  TVariables = Record<string, unknown>,
>({
  accessToken,
  query,
  signal,
  variables,
}: LinearRequestOptions<TVariables>): Promise<TData> => {
  const { LINEAR_BASE_URL } = loadLinearKeys();

  const response = await fetch(LINEAR_BASE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: resolveAuthorizationHeader(accessToken),
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  const payload = (await response.json()) as LinearGraphQLResponse<TData>;

  if (!response.ok || (payload.errors?.length ?? 0) > 0 || !payload.data) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ||
        `Linear request failed with status ${response.status}`
    );
  }

  return payload.data;
};
