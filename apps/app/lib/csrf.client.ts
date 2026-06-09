"use client";

const CSRF_COOKIE_NAME = "xforge_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

const readCookie = (name: string): string | null => {
  for (const cookie of document.cookie.split(";")) {
    const [rawCookieName, ...rawValue] = cookie.split("=");
    const cookieName = rawCookieName?.trim();

    if (cookieName === name) {
      return decodeURIComponent(rawValue.join("=").trim());
    }
  }

  return null;
};

export const withCSRFHeader = (
  headers: Record<string, string> = {}
): Record<string, string> => {
  const token = readCookie(CSRF_COOKIE_NAME);

  return token
    ? {
        ...headers,
        [CSRF_HEADER_NAME]: token,
      }
    : headers;
};
