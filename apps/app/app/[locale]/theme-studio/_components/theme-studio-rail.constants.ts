import type { WorkspaceNavContextOption } from "@repo/ui/components/compose/workspace";
import { Building2, FolderKanban, Layers3, Network, Users } from "lucide-react";

export const THEME_STUDIO_ORGANIZATIONS: WorkspaceNavContextOption[] = [
  {
    id: "org-vf",
    logo: Building2,
    name: "Vietnam Feed Co.",
    subtitle: "VF · Enterprise",
  },
  {
    id: "org-apac",
    logo: Building2,
    name: "APAC Holdings",
    subtitle: "AH · Regional",
  },
];

export const THEME_STUDIO_DEPARTMENTS: WorkspaceNavContextOption[] = [
  {
    id: "dept-brand",
    logo: Layers3,
    name: "Brand Systems",
    subtitle: "Theme Studio",
  },
  {
    id: "dept-erp",
    logo: Users,
    name: "ERP Surfaces",
    subtitle: "6 previews",
  },
];

export const THEME_STUDIO_TEAMS: WorkspaceNavContextOption[] = [
  {
    id: "team-design",
    logo: Network,
    name: "Design Ops",
    subtitle: "Kitchen sink",
  },
  {
    id: "team-product",
    logo: Network,
    name: "Product UX",
    subtitle: "Validation",
  },
];

export const THEME_STUDIO_PROJECTS: WorkspaceNavContextOption[] = [
  {
    id: "proj-rail",
    logo: FolderKanban,
    name: "Workspace Rail",
    subtitle: "Preview 07",
  },
  {
    id: "proj-scorecard",
    logo: FolderKanban,
    name: "Scorecard Gate",
    subtitle: "≥ 85 target",
  },
];

/** Demo identity for Theme Studio app-nav actions popover header. */
export const THEME_STUDIO_DEMO_USER = {
  email: "brand.lead@vietnamfeed.com",
  name: "Brand Lead",
} as const;
