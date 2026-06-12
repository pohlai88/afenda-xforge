export type OrbitLoadStatus = "high" | "balanced" | "low";

export type OrbitWorkloadSnapshot = {
  capacityPercent: number;
  focus: string;
  meetingsToday: number;
  openTasks: number;
  status: OrbitLoadStatus;
};

/** Scaffold workload signal — replace with Orbit service later. */
export const ORBIT_WORKLOAD_SNAPSHOT: OrbitWorkloadSnapshot = {
  capacityPercent: 72,
  focus: "Ship infrastructure matrix scaffold",
  openTasks: 14,
  meetingsToday: 3,
  status: "high",
};

export const ORBIT_STATUS_TONE: Record<
  OrbitLoadStatus,
  { label: string; ring: string; badge: string; progress: string }
> = {
  high: {
    label: "High load",
    ring: "from-amber-400 via-orange-500 to-red-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    progress: "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500",
  },
  balanced: {
    label: "Balanced",
    ring: "from-emerald-400 via-teal-500 to-cyan-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    progress: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500",
  },
  low: {
    label: "Light day",
    ring: "from-sky-400 via-blue-500 to-indigo-500",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    progress: "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500",
  },
};
