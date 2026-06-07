export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_CONFIRM_PATH = "/auth/confirm";
export const AUTH_ERROR_PATH = "/auth/error";
export const AUTH_REDIRECT_SEARCH_PARAM = "next";
export const DEFAULT_AUTHENTICATED_REDIRECT_PATH = "/dashboard";
export const DEFAULT_SIGN_IN_PATH = "/sign-in";
export const DEFAULT_SIGN_UP_PATH = "/sign-up";

const LOCAL_ORIGIN = "http://localhost";

const normalizePath = (value: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed || trimmed.startsWith("//")) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    try {
      const url = new URL(trimmed, LOCAL_ORIGIN);

      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }

  try {
    const url = new URL(trimmed);

    if (!(url.protocol === "http:" || url.protocol === "https:")) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

export const resolvePostAuthRedirectPath = (
  value: string | null | undefined,
  fallback = DEFAULT_AUTHENTICATED_REDIRECT_PATH
): string => normalizePath(value ?? "") ?? fallback;

export const buildSignInPath = (next: string | null | undefined): string => {
  const redirectTo = resolvePostAuthRedirectPath(next);

  if (redirectTo === DEFAULT_AUTHENTICATED_REDIRECT_PATH) {
    return DEFAULT_SIGN_IN_PATH;
  }

  const searchParams = new URLSearchParams({
    [AUTH_REDIRECT_SEARCH_PARAM]: redirectTo,
  });

  return `${DEFAULT_SIGN_IN_PATH}?${searchParams.toString()}`;
};

export const buildSignUpPath = (next: string | null | undefined): string => {
  const redirectTo = resolvePostAuthRedirectPath(next);

  if (redirectTo === DEFAULT_AUTHENTICATED_REDIRECT_PATH) {
    return DEFAULT_SIGN_UP_PATH;
  }

  const searchParams = new URLSearchParams({
    [AUTH_REDIRECT_SEARCH_PARAM]: redirectTo,
  });

  return `${DEFAULT_SIGN_UP_PATH}?${searchParams.toString()}`;
};

export const buildAuthCallbackPath = (
  next: string | null | undefined
): string => {
  const redirectTo = resolvePostAuthRedirectPath(next);
  const searchParams = new URLSearchParams({
    [AUTH_REDIRECT_SEARCH_PARAM]: redirectTo,
  });

  return `${AUTH_CALLBACK_PATH}?${searchParams.toString()}`;
};
