import {
  buildSignInPath,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
} from "@repo/auth";
import { SignUp } from "@repo/auth/components/sign-up";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import type { ReactElement } from "react";

export const metadata: Metadata = createMetadata({
  title: "Sign up",
  description: "Create an XForge account.",
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
      className="space-y-6 rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm"
      redirectTo={redirectTo}
      signInHref={buildSignInPath(redirectTo)}
    />
  );
}
