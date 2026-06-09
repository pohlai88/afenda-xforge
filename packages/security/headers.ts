export type SecurityHeadersOptions = {
  contentSecurityPolicy?: string;
  contentSecurityPolicyReportOnly?: string;
  referrerPolicy?: string;
  frameOptions?: "DENY" | "SAMEORIGIN";
  strictTransportSecurity?: boolean;
};

export type ContentSecurityPolicyOptions = {
  baseUri?: string[];
  connectSrc?: string[];
  defaultSrc?: string[];
  fontSrc?: string[];
  formAction?: string[];
  frameAncestors?: string[];
  imgSrc?: string[];
  objectSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
};

const quoteCspSource = (source: string): string => source.trim();

const createDirective = (name: string, sources: string[]): string =>
  `${name} ${sources.map(quoteCspSource).join(" ")}`;

export const createContentSecurityPolicy = (
  options: ContentSecurityPolicyOptions = {}
): string => {
  const directives = [
    createDirective("default-src", options.defaultSrc ?? ["'self'"]),
    createDirective("object-src", options.objectSrc ?? ["'none'"]),
    createDirective("base-uri", options.baseUri ?? ["'self'"]),
    createDirective("frame-ancestors", options.frameAncestors ?? ["'none'"]),
    createDirective("form-action", options.formAction ?? ["'self'"]),
    createDirective("img-src", options.imgSrc ?? ["'self'", "data:", "blob:"]),
    createDirective("font-src", options.fontSrc ?? ["'self'", "data:"]),
    createDirective(
      "style-src",
      options.styleSrc ?? ["'self'", "'unsafe-inline'"]
    ),
    createDirective("script-src", options.scriptSrc ?? ["'self'"]),
    createDirective("connect-src", options.connectSrc ?? ["'self'"]),
  ];

  return directives.join("; ");
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
