const PUBLIC_PATH_PATTERNS = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/manifest\.json$/,
];

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const isPublicAssetPath = (pathname: string): boolean =>
  PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname));

export const isSafeMethod = (method: string): boolean =>
  SAFE_METHODS.has(method.toUpperCase());

export type RequestSecurityDecision = {
  allow: boolean;
  reason?: string;
  riskSignals: string[];
};

export const createRequestSecurityDecision = (
  request: Request,
  options: {
    blockedPathPrefixes?: string[];
    allowedUserAgents?: string[];
    enableBotProtection?: boolean;
    allowUnsafeMethods?: boolean;
  } = {}
): RequestSecurityDecision => {
  const pathname = new URL(request.url).pathname;
  const userAgent = request.headers.get("user-agent") ?? "";
  const riskSignals: string[] = [];

  if (isPublicAssetPath(pathname)) {
    return { allow: true, reason: "public-asset", riskSignals };
  }

  if (
    options.blockedPathPrefixes?.some((prefix) => pathname.startsWith(prefix))
  ) {
    return { allow: false, reason: "blocked-path", riskSignals };
  }

  if (
    options.enableBotProtection &&
    options.allowedUserAgents?.length &&
    !(
      userAgent &&
      options.allowedUserAgents.some((allowed) => userAgent.includes(allowed))
    )
  ) {
    riskSignals.push("user-agent-unrecognized");
  }

  if (!(isSafeMethod(request.method) || options.allowUnsafeMethods)) {
    return {
      allow: false,
      reason: "unsafe-method",
      riskSignals,
    };
  }

  return { allow: true, reason: "allowed", riskSignals };
};
