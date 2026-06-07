export const ERROR_CODES = {
  BUSINESS_RULE_VIOLATION: {
    statusCode: 422,
    en: "Business rule violation",
    vi: "Vi pham quy tac nghiep vu",
  },
  CONFIGURATION_ERROR: {
    statusCode: 500,
    en: "Configuration error",
    vi: "Loi cau hinh",
  },
  CONFLICT: {
    statusCode: 409,
    en: "Conflict",
    vi: "Xung dot du lieu",
  },
  FEATURE_NOT_AVAILABLE: {
    statusCode: 403,
    en: "Feature not available",
    vi: "Tinh nang chua kha dung",
  },
  FORBIDDEN: {
    statusCode: 403,
    en: "Forbidden",
    vi: "Khong co quyen",
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    en: "Internal error",
    vi: "Loi he thong",
  },
  INVALID_RESOURCE_STATE: {
    statusCode: 422,
    en: "Invalid resource state",
    vi: "Trang thai tai nguyen khong hop le",
  },
  NOT_FOUND: {
    statusCode: 404,
    en: "Not found",
    vi: "Khong tim thay",
  },
  PLAN_LIMIT_EXCEEDED: {
    statusCode: 403,
    en: "Plan limit exceeded",
    vi: "Vuot gioi han goi",
  },
  RATE_LIMITED: {
    statusCode: 429,
    en: "Rate limited",
    vi: "Qua nhieu yeu cau",
  },
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    en: "Service unavailable",
    vi: "Dich vu khong kha dung",
  },
  UNAUTHORIZED: {
    statusCode: 401,
    en: "Unauthorized",
    vi: "Chua xac thuc",
  },
  VALIDATION_ERROR: {
    statusCode: 422,
    en: "Validation error",
    vi: "Du lieu khong hop le",
  },
} as const;

export type ErrorCatalogEntry = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export type ErrorLocale = "en" | "vi";

export type RegisteredErrorCode = keyof typeof ERROR_CODES;

export const getErrorCatalogEntry = (
  code: string
): ErrorCatalogEntry | null => {
  if (code in ERROR_CODES) {
    return ERROR_CODES[code as RegisteredErrorCode];
  }

  return null;
};

export const getErrorCatalogMessage = (
  code: string,
  locale: ErrorLocale = "en"
): string | null => getErrorCatalogEntry(code)?.[locale] ?? null;
