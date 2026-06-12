export type OrbitSystemStatus = "calm" | "watch" | "risk" | "breach";

export type OrbitWorkloadSnapshot = {
  dueTodayCount: number;
  nextEventLabel: string;
  nextTimeLeftText: string;
  orbitName: string;
  openCount: number;
  slaSafetyLabel: string;
  slaPercent: number;
  status: OrbitSystemStatus;
};

/** Scaffold workload signal — replace with Orbit service later. */
export const ORBIT_WORKLOAD_SNAPSHOT: OrbitWorkloadSnapshot = {
  dueTodayCount: 4,
  nextEventLabel: "Invoice approval",
  nextTimeLeftText: "42m",
  openCount: 18,
  orbitName: "Finance Ops",
  slaSafetyLabel: "safe",
  slaPercent: 87,
  status: "watch",
};

export const ORBIT_STATUS_TONE: Record<
  OrbitSystemStatus,
  { dot: string; label: string; meter: string; text: string }
> = {
  breach: {
    dot: "bg-red-500",
    label: "BREACH",
    meter: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
  },
  calm: {
    dot: "bg-emerald-500",
    label: "CALM",
    meter: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  risk: {
    dot: "bg-orange-500",
    label: "RISK",
    meter: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
  },
  watch: {
    dot: "bg-amber-500",
    label: "WATCH",
    meter: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
};

export const ORBIT_SLA_METER_SEGMENTS = 10;

export const ORBIT_SLA_METER_SEGMENT_IDS = Array.from(
  { length: ORBIT_SLA_METER_SEGMENTS },
  (_, index) => `orbit-sla-segment-${index + 1}`
);

export function getOrbitFilledSlaSegments(
  slaPercent: number,
  segments = ORBIT_SLA_METER_SEGMENTS
): number {
  const boundedPercent = Math.max(0, Math.min(100, slaPercent));

  return Math.max(0, Math.min(segments, Math.floor(boundedPercent / 10)));
}
