export type GeistStudioSection = {
  description: string;
  href: `#${string}`;
  id: string;
  title: string;
};

export const GEIST_STUDIO_SECTIONS: readonly GeistStudioSection[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Principles and contract sources",
    href: "#overview",
  },
  {
    id: "colors",
    title: "Colors",
    description: "Surface, text, interactive, and status-dot tokens",
    href: "#colors",
  },
  {
    id: "typography",
    title: "Typography",
    description: "Geist Sans and Geist Mono type ramp",
    href: "#typography",
  },
  {
    id: "materials",
    title: "Materials",
    description: "Elevation tiers and shadow-as-border",
    href: "#materials",
  },
  {
    id: "components",
    title: "Components",
    description: "Buttons, inputs, links, and status markers",
    href: "#components",
  },
  {
    id: "guidelines",
    title: "Guidelines",
    description: "Implementation rules for downstream surfaces",
    href: "#guidelines",
  },
  {
    id: "conflicts",
    title: "Afenda conflicts",
    description: "Where globals.css diverges from Geist and how studio fixes it",
    href: "#conflicts",
  },
] as const;
