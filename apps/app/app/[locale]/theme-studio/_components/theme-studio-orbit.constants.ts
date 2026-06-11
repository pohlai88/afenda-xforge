type ThemeStudioOrbitLabelColor = "rose" | "emerald" | "amber" | "sky";

export type ThemeStudioOrbitLabel = {
  color: ThemeStudioOrbitLabelColor;
  id: string;
  name: string;
};

/** Theme Studio preview seed — app layer owns real orbit stats later. */
export const THEME_STUDIO_ORBIT_SEED = {
  openCount: 24,
  urgentCount: 4,
} as const;

export const THEME_STUDIO_ORBIT_LABELS: ThemeStudioOrbitLabel[] = [
  { color: "rose", id: "work", name: "Work" },
  { color: "emerald", id: "personal", name: "Personal" },
  { color: "amber", id: "team", name: "Team" },
  { color: "sky", id: "goals", name: "Goals" },
];
