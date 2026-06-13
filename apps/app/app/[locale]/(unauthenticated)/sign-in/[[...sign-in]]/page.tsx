import { SignIn } from "@repo/auth/components/sign-in";
import {
  buildSignUpPath,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
} from "@repo/auth/routes";
import { createMetadata } from "@repo/seo/metadata";
import { createAppSitePreset } from "@repo/seo/presets";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { LOCAL_DEVELOPER_LOGIN } from "../../../../../lib/developer-login.constants.ts";
import { DeveloperLoginHint } from "../_components/developer-login-hint.tsx";

const appSitePreset = createAppSitePreset(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
);

export const metadata: Metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to XForge.",
  site: appSitePreset.site,
});

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

const isDevelopment = process.env.NODE_ENV === "development";

export default async function SignInPage({
  searchParams,
}: SignInPageProps): Promise<ReactElement> {
  const params = (await searchParams) ?? {};
  const redirectTo = resolvePostAuthRedirectPath(
    params.next,
    DEFAULT_AUTHENTICATED_REDIRECT_PATH
  );

  return (
    <div className="space-y-6">
      <SignIn
        className="space-y-6 rounded-xl border border-border bg-card/95 p-6 shadow-sm"
        developmentDefaults={
          isDevelopment ? LOCAL_DEVELOPER_LOGIN : undefined
        }
        redirectTo={redirectTo}
        signUpHref={buildSignUpPath(redirectTo)}
      />
      {isDevelopment ? <DeveloperLoginHint /> : null}
    </div>
  );
}
