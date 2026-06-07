export type SecurityHeadersOptions = {
  contentSecurityPolicy?: string;
  contentSecurityPolicyReportOnly?: string;
  referrerPolicy?: string;
  frameOptions?: "DENY" | "SAMEORIGIN";
  strictTransportSecurity?: boolean;
};

export const createSecurityHeaders = ({
  contentSecurityPolicy,
  contentSecurityPolicyReportOnly,
  referrerPolicy = "strict-origin-when-cross-origin",
  frameOptions = "DENY",
  strictTransportSecurity = true,
}: SecurityHeadersOptions = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": frameOptions,
    "Referrer-Policy": referrerPolicy,
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-site",
  };

  if (strictTransportSecurity) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains; preload";
  }

  if (contentSecurityPolicy) {
    headers["Content-Security-Policy"] = contentSecurityPolicy;
  }

  if (contentSecurityPolicyReportOnly) {
    headers["Content-Security-Policy-Report-Only"] =
      contentSecurityPolicyReportOnly;
  }

  return headers;
};
