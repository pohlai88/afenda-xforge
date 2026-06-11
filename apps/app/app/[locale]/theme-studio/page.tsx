import { redirect } from "next/navigation";
import { localizedPath } from "@/i18n/locale-prefix";
import { DEFAULT_THEME_STUDIO_HREF } from "./_components/theme-studio-routes.ts";

type ThemeStudioIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ThemeStudioIndexPage({
  params,
}: ThemeStudioIndexPageProps): Promise<never> {
  const { locale } = await params;

  redirect(localizedPath(DEFAULT_THEME_STUDIO_HREF, locale));
}
