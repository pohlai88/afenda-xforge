export const xforgeColorSystemV3 = {
  brand: { primary: 198, secondary: 250, accent: 68 },
  status: { success: 145, warning: 50, destructive: 27, info: 230 },
  lanes: {
    money: 160,
    people: 330,
    goods: 95,
    operations: 212,
    customer: 272,
    governance: 305,
    intelligence: 184,
  },
  charts: {
    chart1: 198,
    chart2: 250,
    chart3: 160,
    chart4: 68,
    chart5: 285,
    chart6: 212,
    chart7: 330,
  },
} as const;

export const MIN_HUE_SEPARATION = {
  brandVsStatus: 10,
  laneVsStatus: 10,
  laneVsLane: 15,
  laneVsLaneTinyUi: 18,
} as const;

export const COLOR_HUE_FAMILIES = [
  "brand-primary",
  "brand-secondary",
  "brand-accent",
  "status-success",
  "status-warning",
  "status-destructive",
  "status-info",
  "lane-money",
  "lane-people",
  "lane-goods",
  "lane-operations",
  "lane-customer",
  "lane-governance",
  "lane-intelligence",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
] as const;

export type ColorHueFamily = (typeof COLOR_HUE_FAMILIES)[number];

export type HueFamilyCategory = "brand" | "status" | "lane" | "chart";

export type HueReservationEntry = {
  category: HueFamilyCategory;
  family: ColorHueFamily | string;
  hue: number;
  source?: string;
};

export type HueCollision = {
  a: HueReservationEntry;
  b: HueReservationEntry;
  distance: number;
  minimumRequired: number;
  rule: string;
  severity: "error" | "warning";
};

export type HueValidationResult = {
  collisions: HueCollision[];
  valid: boolean;
  warnings: HueCollision[];
};

export type ParsedOklch = {
  alpha?: number;
  c: number;
  h: number;
  l: number;
};

const OKLCH_PATTERN =
  /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;

export function parseOklch(value: string): ParsedOklch | null {
  const match = value.trim().match(OKLCH_PATTERN);
  if (!match) {
    return null;
  }

  const [, lightness, chroma, hue, alpha] = match;
  let alphaValue: number | undefined;
  if (alpha) {
    alphaValue = alpha.endsWith("%")
      ? Number.parseFloat(alpha) / 100
      : Number.parseFloat(alpha);
  }

  return {
    l: Number.parseFloat(lightness),
    c: Number.parseFloat(chroma),
    h: Number.parseFloat(hue),
    alpha: alphaValue,
  };
}

export function extractHue(tokenValue: string): number | null {
  const trimmed = tokenValue.trim();

  if (trimmed.startsWith("oklch(")) {
    return parseOklch(trimmed)?.h ?? null;
  }

  const embeddedOklch = trimmed.match(/oklch\(\s*[\d.]+\s+[\d.]+\s+([\d.]+)/i);
  if (embeddedOklch) {
    return Number.parseFloat(embeddedOklch[1]);
  }

  const hueSuffix = trimmed.match(/\s([\d.]+)\)$/);
  if (hueSuffix) {
    return Number.parseFloat(hueSuffix[1]);
  }

  return null;
}

export function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function categoryOf(entry: HueReservationEntry): HueFamilyCategory {
  return entry.category;
}

function isStatusCategory(category: HueFamilyCategory): boolean {
  return category === "status";
}

function _isBrandOrLaneCategory(category: HueFamilyCategory): boolean {
  return category === "brand" || category === "lane";
}

function minimumSeparation(
  left: HueReservationEntry,
  right: HueReservationEntry
): { minimum: number; rule: string } | null {
  const leftCategory = categoryOf(left);
  const rightCategory = categoryOf(right);

  if (leftCategory === "chart" || rightCategory === "chart") {
    return null;
  }

  if (
    (leftCategory === "brand" && isStatusCategory(rightCategory)) ||
    (rightCategory === "brand" && isStatusCategory(leftCategory))
  ) {
    return {
      minimum: MIN_HUE_SEPARATION.brandVsStatus,
      rule: "brand-vs-status",
    };
  }

  if (
    (leftCategory === "lane" && isStatusCategory(rightCategory)) ||
    (rightCategory === "lane" && isStatusCategory(leftCategory))
  ) {
    return {
      minimum: MIN_HUE_SEPARATION.laneVsStatus,
      rule: "lane-vs-status",
    };
  }

  if (leftCategory === "lane" && rightCategory === "lane") {
    return {
      minimum: MIN_HUE_SEPARATION.laneVsLane,
      rule: "lane-vs-lane",
    };
  }

  return null;
}

export function validateHueReservation(
  entries: readonly HueReservationEntry[]
): HueValidationResult {
  const collisions: HueCollision[] = [];
  const warnings: HueCollision[] = [];

  for (let index = 0; index < entries.length; index += 1) {
    for (
      let otherIndex = index + 1;
      otherIndex < entries.length;
      otherIndex += 1
    ) {
      const left = entries[index];
      const right = entries[otherIndex];
      const rule = minimumSeparation(left, right);

      if (!rule) {
        continue;
      }

      const distance = hueDistance(left.hue, right.hue);
      if (distance >= rule.minimum) {
        if (
          rule.rule === "lane-vs-lane" &&
          distance < MIN_HUE_SEPARATION.laneVsLaneTinyUi
        ) {
          warnings.push({
            a: left,
            b: right,
            distance,
            minimumRequired: MIN_HUE_SEPARATION.laneVsLaneTinyUi,
            rule: "lane-vs-lane-tiny-ui",
            severity: "warning",
          });
        }
        continue;
      }

      collisions.push({
        a: left,
        b: right,
        distance,
        minimumRequired: rule.minimum,
        rule: rule.rule,
        severity: "error",
      });
    }
  }

  return {
    valid: collisions.length === 0,
    collisions,
    warnings,
  };
}

export function collectReservedStatusHueEntries(): HueReservationEntry[] {
  return [
    {
      family: "status-success",
      category: "status",
      hue: xforgeColorSystemV3.status.success,
    },
    {
      family: "status-warning",
      category: "status",
      hue: xforgeColorSystemV3.status.warning,
    },
    {
      family: "status-destructive",
      category: "status",
      hue: xforgeColorSystemV3.status.destructive,
    },
    {
      family: "status-info",
      category: "status",
      hue: xforgeColorSystemV3.status.info,
    },
  ];
}

export function formatHueValidationReport(result: HueValidationResult): string {
  const lines: string[] = [];

  for (const collision of result.collisions) {
    lines.push(
      `[error] ${collision.rule}: ${collision.a.family} (${collision.a.hue}°) vs ${collision.b.family} (${collision.b.hue}°) — ${collision.distance.toFixed(1)}° < ${collision.minimumRequired}°`
    );
  }

  for (const warning of result.warnings) {
    lines.push(
      `[warn] ${warning.rule}: ${warning.a.family} (${warning.a.hue}°) vs ${warning.b.family} (${warning.b.hue}°) — ${warning.distance.toFixed(1)}° < ${warning.minimumRequired}°`
    );
  }

  return lines.join("\n");
}
