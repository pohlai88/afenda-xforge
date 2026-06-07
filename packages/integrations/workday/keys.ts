import type { WorkdayKeys } from "./types.ts";

const optionalUrl = (
  value: string | undefined,
  key: string
): string | undefined => {
  if (!value) {
    return;
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${key} must be a valid URL`);
  }
};

export const keys = (): WorkdayKeys => ({
  WORKDAY_ACCESS_TOKEN: process.env.WORKDAY_ACCESS_TOKEN,
  WORKDAY_API_BASE_URL: optionalUrl(
    process.env.WORKDAY_API_BASE_URL,
    "WORKDAY_API_BASE_URL"
  ),
  WORKDAY_CLIENT_ID: process.env.WORKDAY_CLIENT_ID,
  WORKDAY_CLIENT_SECRET: process.env.WORKDAY_CLIENT_SECRET,
  WORKDAY_SCOPE: process.env.WORKDAY_SCOPE,
  WORKDAY_TOKEN_URL: optionalUrl(
    process.env.WORKDAY_TOKEN_URL,
    "WORKDAY_TOKEN_URL"
  ),
});

let cachedWorkdayKeys: WorkdayKeys | null = null;

export const loadWorkdayKeys = (): WorkdayKeys =>
  (cachedWorkdayKeys ??= keys());
