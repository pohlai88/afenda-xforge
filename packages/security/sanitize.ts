const XSS_PATTERNS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const IDENTIFIER_REGEX = /^[a-zA-Z0-9_-]+$/;
const SAFE_QUERY_REGEX = /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;

export const sanitizeInput = (input: unknown): string => {
  if (input === null || input === undefined) {
    return "";
  }

  return String(input)
    .trim()
    .replace(/[&<>"'`/]/g, (character) => XSS_PATTERNS[character] ?? character);
};

export const sanitizeHTML = (input: unknown): string => {
  if (input === null || input === undefined) {
    return "";
  }

  return String(input).replace(/<[^>]*>/g, "");
};

export const validateIdentifier = (identifier: string): boolean => {
  if (typeof identifier !== "string" || identifier.length === 0) {
    return false;
  }

  if (identifier.length > 255) {
    return false;
  }

  return IDENTIFIER_REGEX.test(identifier);
};

export const validateQueryParam = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  const stringValue = String(value);

  if (stringValue.length > 2048) {
    return false;
  }

  return SAFE_QUERY_REGEX.test(stringValue);
};

const sanitizeQueryValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    if (value.length > 2048) {
      return null;
    }

    if (!validateQueryParam(value)) {
      return null;
    }

    return value;
  }

  return null;
};

export const sanitizeQuery = (
  params: Record<string, unknown>
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!validateIdentifier(key)) {
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value
        .map((entry) => sanitizeQueryValue(entry))
        .filter((entry) => entry !== null);
      continue;
    }

    const sanitizedValue = sanitizeQueryValue(value);

    if (sanitizedValue !== null) {
      sanitized[key] = sanitizedValue;
    }
  }

  return sanitized;
};

export const sanitizeEmail = (email: unknown): string | null => {
  if (typeof email !== "string") {
    return null;
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return null;
  }

  return sanitizeInput(trimmed);
};

export const sanitizeURL = (url: unknown): string | null => {
  if (typeof url !== "string") {
    return null;
  }

  try {
    const urlObject = new URL(url);

    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return null;
    }

    return urlObject.toString();
  } catch {
    return null;
  }
};

export const sanitizeNumber = (
  value: unknown,
  min?: number,
  max?: number
): number | null => {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || !Number.isFinite(numberValue)) {
    return null;
  }

  if (min !== undefined && numberValue < min) {
    return null;
  }

  if (max !== undefined && numberValue > max) {
    return null;
  }

  return numberValue;
};

export const sanitizePhoneNumber = (phone: unknown): string | null => {
  if (typeof phone !== "string") {
    return null;
  }

  const cleaned = phone.replace(/[^\d+-]/g, "");
  const digitCount = cleaned.replace(/\D/g, "").length;

  if (digitCount < 7 || digitCount > 15) {
    return null;
  }

  return cleaned;
};

export const validateVietnamesePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|0)[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};
