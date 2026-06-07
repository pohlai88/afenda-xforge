import type { SecurityHeadersOptions } from "./headers.js";
import { keys } from "./keys.js";
import type { SecurityProvider } from "./provider.js";
import { createNoopSecurityProvider } from "./provider.js";

export type SecurityPolicy = {
  name: string;
  enableStrictHeaders: boolean;
  enableBotProtection: boolean;
  allowUnsafeMethods: boolean;
  blockedPathPrefixes: string[];
  allowedUserAgents: string[];
  headers: SecurityHeadersOptions;
  provider: SecurityProvider;
};

export type SecurityPolicyOverrides = Partial<
  Omit<SecurityPolicy, "provider"> & {
    provider: SecurityProvider;
  }
>;

const splitCsv = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

export const createSecurityPolicy = (
  overrides: SecurityPolicyOverrides = {}
): SecurityPolicy => {
  const env = keys();

  return {
    name: overrides.name ?? "xforge-security",
    enableStrictHeaders:
      overrides.enableStrictHeaders ??
      env.SECURITY_ENABLE_STRICT_HEADERS ??
      true,
    enableBotProtection:
      overrides.enableBotProtection ??
      env.SECURITY_ENABLE_BOT_PROTECTION ??
      false,
    allowUnsafeMethods:
      overrides.allowUnsafeMethods ??
      env.SECURITY_ALLOW_UNSAFE_METHODS ??
      false,
    blockedPathPrefixes:
      overrides.blockedPathPrefixes ??
      splitCsv(env.SECURITY_BLOCKED_PATH_PREFIXES),
    allowedUserAgents:
      overrides.allowedUserAgents ?? splitCsv(env.SECURITY_ALLOWED_USER_AGENTS),
    headers: overrides.headers ?? {
      contentSecurityPolicy: env.SECURITY_CONTENT_SECURITY_POLICY,
      contentSecurityPolicyReportOnly:
        env.SECURITY_CONTENT_SECURITY_POLICY_REPORT_ONLY,
      referrerPolicy: env.SECURITY_REFERRER_POLICY,
      frameOptions: env.SECURITY_FRAME_OPTIONS,
    },
    provider: overrides.provider ?? createNoopSecurityProvider(),
  };
};
