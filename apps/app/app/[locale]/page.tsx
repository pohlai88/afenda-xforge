import { getUser } from "@repo/auth/server";
import { setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";
import { redirect } from "@/i18n/navigation";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({
  params,
}: HomePageProps): Promise<never> {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();

  redirect({ href: user ? "/dashboard" : "/sign-in", locale });
  throw new Error("Home page redirect did not complete.");
}
