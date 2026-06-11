import { redirect } from "next/navigation";

import { DEFAULT_THEME_STUDIO_HREF } from "./_components/theme-studio-routes.ts";

export default function ThemeStudioIndexPage(): never {
  redirect(DEFAULT_THEME_STUDIO_HREF);
}
