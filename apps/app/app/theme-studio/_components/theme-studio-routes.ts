export type ThemeStudioPage = {
  description: string;
  href: `/theme-studio/${string}`;
  label: string;
  number: string;
  slug: string;
  weight: string;
};

export const THEME_STUDIO_PAGES: readonly ThemeStudioPage[] = [
  {
    number: "01",
    slug: "executive-dashboard",
    label: "Executive Dashboard",
    href: "/theme-studio/executive-dashboard",
    weight: "35%",
    description: "Brand CTAs, charts, KPIs, lane accents",
  },
  {
    number: "02",
    slug: "data-grid",
    label: "Data Grid",
    href: "/theme-studio/data-grid",
    weight: "25%",
    description: "Dense tables, filters, badges, row actions",
  },
  {
    number: "03",
    slug: "form-experience",
    label: "Form Experience",
    href: "/theme-studio/form-experience",
    weight: "15%",
    description: "Inputs, validation, focus, approval submit",
  },
  {
    number: "04",
    slug: "erp-navigation",
    label: "ERP Navigation",
    href: "/theme-studio/erp-navigation",
    weight: "10%",
    description: "Sidebar, modules, lane mapping, collapsed rail",
  },
  {
    number: "05",
    slug: "nexus-lynx",
    label: "Nexus / Lynx",
    href: "/theme-studio/nexus-lynx",
    weight: "10%",
    description: "Evidence, reasoning, decision, governance handoff",
  },
  {
    number: "06",
    slug: "analytics",
    label: "Analytics",
    href: "/theme-studio/analytics",
    weight: "5%",
    description: "Chart series, legends, heatmaps, status separation",
  },
] as const;

export const DEFAULT_THEME_STUDIO_HREF = THEME_STUDIO_PAGES[0]?.href ?? "/theme-studio/executive-dashboard";

export function isThemeStudioPathActive(
  pathname: string,
  href: ThemeStudioPage["href"]
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
