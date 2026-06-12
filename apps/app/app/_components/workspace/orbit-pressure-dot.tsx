"use client";

import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import type { OrbitTrailPressure } from "./orbit-trail.ts";
import { ORBIT_TRAIL_PRESSURE_DOT_CLASS } from "./orbit-trail.ts";

export function OrbitPressureDot({
  pressure,
}: {
  pressure: OrbitTrailPressure;
}): ReactElement {
  return (
    <span
      aria-label={`${pressure} pressure`}
      className={cn(
        "size-2 shrink-0 rounded-full",
        ORBIT_TRAIL_PRESSURE_DOT_CLASS[pressure]
      )}
      role="img"
    />
  );
}
