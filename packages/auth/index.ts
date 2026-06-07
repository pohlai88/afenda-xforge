export { createBrowserSupabaseClient } from "./client.ts";
export type { SignInProps } from "./components/sign-in.tsx";
export { SignIn } from "./components/sign-in.tsx";
export type { SignOutProps } from "./components/sign-out.tsx";
export { SignOut } from "./components/sign-out.tsx";
export type { SignUpProps } from "./components/sign-up.tsx";
export { SignUp } from "./components/sign-up.tsx";
export type { AuthKeys } from "./keys.ts";
export { keys, loadAuthKeys } from "./keys.ts";
export type { AuthProviderProps } from "./provider.tsx";
export { AuthProvider, useAuthClient } from "./provider.tsx";
export type { AuthProxyResult } from "./proxy.ts";
export { authMiddleware, updateSession } from "./proxy.ts";
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
export {
  ACTIVE_COMPANY_COOKIE_NAME,
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
  exchangeCodeForSession,
  formatDemoUserIdEnv,
  getActiveCompanyGrant,
  getActiveTenantMembership,
  getCurrentAuthenticatedUserId,
  getSession,
  getUser,
  requireActiveCompanyAccess,
  requireActiveCompanyGrant,
  requireActiveTenantAccess,
  requireActiveTenantMembership,
  requireAuth,
  verifyOtpCode,
} from "./server.ts";
