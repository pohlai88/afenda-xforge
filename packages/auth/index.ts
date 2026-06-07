export { createBrowserSupabaseClient } from "./client.js";
export type { SignInProps } from "./components/sign-in.js";
export { SignIn } from "./components/sign-in.js";
export type { SignOutProps } from "./components/sign-out.js";
export { SignOut } from "./components/sign-out.js";
export type { SignUpProps } from "./components/sign-up.js";
export { SignUp } from "./components/sign-up.js";
export type { AuthKeys } from "./keys.js";
export { keys, loadAuthKeys } from "./keys.js";
export type { AuthProviderProps } from "./provider.js";
export { AuthProvider, useAuthClient } from "./provider.js";
export type { AuthProxyResult } from "./proxy.js";
export { authMiddleware, updateSession } from "./proxy.js";
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
} from "./routes.js";
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
} from "./server.js";
