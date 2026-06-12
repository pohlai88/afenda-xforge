import { redirect } from "@/i18n/navigation";
import { DEFAULT_THEME_STUDIO_HREF } from "./_components/theme-studio-routes.ts";

type ThemeStudioIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ThemeStudioIndexPage({
  params,
}: ThemeStudioIndexPageProps): Promise<never> {
  const { locale } = await params;

  redirect({ href: DEFAULT_THEME_STUDIO_HREF, locale });
  throw new Error("Theme studio redirect did not complete.");
}
