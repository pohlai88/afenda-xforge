import { loadSecurityKeys } from "./keys.ts";

export type SecurityCorsOptions = {
  origin?: string | string[] | RegExp | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  exposedHeaders?: string[];
};

const parseAllowedOrigins = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

export const createSecurityCorsConfig = (
  options: SecurityCorsOptions = {}
): SecurityCorsOptions => {
  const env = loadSecurityKeys();

  return {
    origin: options.origin ?? parseAllowedOrigins(env.SECURITY_ALLOWED_ORIGINS),
    methods: options.methods ?? [
      "GET",
      "HEAD",
      "PUT",
      "PATCH",
      "POST",
      "DELETE",
    ],
    allowedHeaders: options.allowedHeaders ?? [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
    credentials: options.credentials ?? true,
    maxAge: options.maxAge ?? 86_400,
    exposedHeaders: options.exposedHeaders ?? [
      "X-Total-Count",
      "X-Page",
      "X-Page-Size",
    ],
  };
};

export const developmentSecurityCors = (): SecurityCorsOptions =>
  createSecurityCorsConfig({
    origin: () => true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true,
    maxAge: 3600,
  });

export const productionSecurityCors = (
  allowedOrigins: string[] = []
): SecurityCorsOptions => {
  const env = loadSecurityKeys();
  const origins =
    allowedOrigins.length > 0
      ? allowedOrigins
      : parseAllowedOrigins(env.SECURITY_ALLOWED_ORIGINS);

  return createSecurityCorsConfig({
    origin: (origin: string) => {
      if (!origin) {
        return true;
      }

      return origins.includes(origin);
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86_400,
  });
};

export const applySecurityCorsHeaders = (
  headers: Record<string, string>,
  options: SecurityCorsOptions,
  requestOrigin?: string
): Record<string, string> => {
  const result = { ...headers };
  const origin = requestOrigin?.trim();

  let originAllowed = false;

  if (!origin) {
    originAllowed = false;
  } else if (typeof options.origin === "function") {
    originAllowed = options.origin(origin);
  } else if (typeof options.origin === "string") {
    originAllowed =
      options.origin === origin ||
      (options.origin === "*" && options.credentials !== true);
  } else if (Array.isArray(options.origin)) {
    originAllowed = options.origin.includes(origin);
  } else if (options.origin instanceof RegExp) {
    originAllowed = options.origin.test(origin);
  }

  if (originAllowed && origin) {
    result["Access-Control-Allow-Origin"] = origin;
    result.Vary = result.Vary ? `${result.Vary}, Origin` : "Origin";
  }

  if (options.credentials && originAllowed) {
    result["Access-Control-Allow-Credentials"] = "true";
  }

  if (options.methods?.length) {
    result["Access-Control-Allow-Methods"] = options.methods.join(", ");
  }

  if (options.allowedHeaders?.length) {
    result["Access-Control-Allow-Headers"] = options.allowedHeaders.join(", ");
  }

  if (options.maxAge) {
    result["Access-Control-Max-Age"] = String(options.maxAge);
  }

  if (options.exposedHeaders?.length) {
    result["Access-Control-Expose-Headers"] = options.exposedHeaders.join(", ");
  }

  return result;
};
