export type LinearKeys = {
  readonly LINEAR_API_KEY?: string;
  readonly LINEAR_BASE_URL: string;
  readonly LINEAR_WEBHOOK_SECRET?: string;
};

const DEFAULT_LINEAR_BASE_URL = "https://api.linear.app/graphql";

const requireUrl = (value: string, key: string): string => {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${key} must be a valid URL`);
  }
};

export const keys = (): LinearKeys => {
  const LINEAR_BASE_URL = process.env.LINEAR_BASE_URL
    ? requireUrl(process.env.LINEAR_BASE_URL, "LINEAR_BASE_URL")
    : DEFAULT_LINEAR_BASE_URL;

  return {
    LINEAR_API_KEY: process.env.LINEAR_API_KEY,
    LINEAR_BASE_URL,
    LINEAR_WEBHOOK_SECRET: process.env.LINEAR_WEBHOOK_SECRET,
  };
};

let cachedLinearKeys: LinearKeys | null = null;

export const loadLinearKeys = (): LinearKeys => (cachedLinearKeys ??= keys());
