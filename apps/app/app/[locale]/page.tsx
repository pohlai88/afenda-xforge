import { getUser } from "@repo/auth/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { localizedPath } from "@/i18n/locale-prefix";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({
  params,
}: HomePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();

  redirect(localizedPath(user ? "/dashboard" : "/sign-in", locale));
}
