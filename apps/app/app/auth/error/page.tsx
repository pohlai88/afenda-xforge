import {
  AUTH_CALLBACK_PATH,
  AUTH_CONFIRM_PATH,
  DEFAULT_SIGN_IN_PATH,
} from "@repo/auth/routes";
import { createMetadata } from "@repo/seo/metadata";
import { createAppSitePreset } from "@repo/seo/presets";
import type { Metadata } from "next";
import type { ReactElement } from "react";

const appSitePreset = createAppSitePreset(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
);

export const metadata: Metadata = createMetadata({
  title: "Authentication error",
  description: "Authentication could not be completed.",
  site: appSitePreset.site,
});

type AuthErrorPageProps = {
  searchParams?: Promise<{
    reason?: string;
  }>;
};

const getMessage = (reason: string | undefined): string => {
  switch (reason) {
    case "callback":
      return `Supabase did not complete the PKCE callback at ${AUTH_CALLBACK_PATH}.`;
    case "confirm":
      return `Supabase could not verify the confirmation link at ${AUTH_CONFIRM_PATH}.`;
    default:
      return "Authentication could not be completed.";
  }
};

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps): Promise<ReactElement> {
  const params = (await searchParams) ?? {};

  return (
    <section className="space-y-6 rounded-xl border border-border bg-card/95 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
          XForge
        </p>
        <h1 className="font-semibold text-2xl tracking-tight">
          Authentication error
        </h1>
        <p className="text-muted-foreground">{getMessage(params.reason)}</p>
      </div>
      <a
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
        href={DEFAULT_SIGN_IN_PATH}
      >
        Return to sign in
      </a>
    </section>
  );
}
