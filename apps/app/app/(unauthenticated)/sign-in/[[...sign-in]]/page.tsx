import {
  buildSignUpPath,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
} from "@repo/auth";
import { SignIn } from "@repo/auth/components/sign-in";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import type { ReactElement } from "react";

export const metadata: Metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to XForge.",
});

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({
  searchParams,
}: SignInPageProps): Promise<ReactElement> {
  const params = (await searchParams) ?? {};
  const redirectTo = resolvePostAuthRedirectPath(
    params.next,
    DEFAULT_AUTHENTICATED_REDIRECT_PATH
  );

  return (
    <SignIn
      className="space-y-6 rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm"
      redirectTo={redirectTo}
      signUpHref={buildSignUpPath(redirectTo)}
    />
  );
}
