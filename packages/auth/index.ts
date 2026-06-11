/**
 * Client-safe and universal auth surface.
 * Server runtime: `@repo/auth/server`, `@repo/auth/access`, `@repo/auth/proxy`, `@repo/auth/keys`.
 * Client runtime: `@repo/auth/client`, `@repo/auth/provider`, `@repo/auth/components/*`.
 */
export { resolveTenantSlugFromHost } from "./host.ts";
export {
  AUTH_CALLBACK_PATH,
  AUTH_CONFIRM_PATH,
  AUTH_ERROR_PATH,
  AUTH_REDIRECT_SEARCH_PARAM,
  buildAuthCallbackPath,
  buildSignInPath,
  buildSignUpPath,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  DEFAULT_SIGN_IN_PATH,
  DEFAULT_SIGN_UP_PATH,
  resolvePostAuthRedirectPath,
} from "./routes.ts";
export type { TrustedTenantContext } from "./trusted.ts";
export {
  createTrustedTenantContext,
  isTrustedTenantContext,
} from "./trusted.ts";
