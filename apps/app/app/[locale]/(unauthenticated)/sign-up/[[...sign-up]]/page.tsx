import { SignUp } from "@repo/auth/components/sign-up";
import {
  buildSignInPath,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
} from "@repo/auth/routes";
import { createMetadata } from "@repo/seo/metadata";
import { createAppSitePreset } from "@repo/seo/presets";
import type { Metadata } from "next";
import type { ReactElement } from "react";

const appSitePreset = createAppSitePreset(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
);

export const metadata: Metadata = createMetadata({
  title: "Sign up",
  description: "Create an XForge account.",
  site: appSitePreset.site,
});

type SignUpPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps): Promise<ReactElement> {
  const params = (await searchParams) ?? {};
  const redirectTo = resolvePostAuthRedirectPath(
    params.next,
    DEFAULT_AUTHENTICATED_REDIRECT_PATH
  );

  return (
    <SignUp
      className="space-y-6 rounded-xl border border-border bg-card/95 p-6 shadow-sm"
      redirectTo={redirectTo}
      signInHref={buildSignInPath(redirectTo)}
    />
  );
}
