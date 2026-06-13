/**
 * Local-only developer credentials for Supabase Auth.
 * Shown on the sign-in page in development and provisioned via `pnpm --filter app dev:login`.
 */
export const LOCAL_DEVELOPER_LOGIN = {
  email: "developer@xforge.local",
  password: "XforgeDev!2026",
} as const;

export const LOCAL_DEVELOPER_LOGIN_PROVISION_COMMAND =
  "pnpm --filter app dev:login";
