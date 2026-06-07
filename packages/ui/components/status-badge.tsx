import { cn } from "@repo/design-system/lib/utils";
import type { ReactElement, ReactNode } from "react";

export type StatusBadgeTone = "danger" | "neutral" | "success" | "warning";

const toneClassNames: Record<StatusBadgeTone, string> = {
  danger: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  neutral: "border-border bg-muted text-muted-foreground",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusBadgeTone;
};

export const StatusBadge = ({
  children,
  tone = "neutral",
}: StatusBadgeProps): ReactElement => (
  <span
    className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 font-medium text-xs",
      toneClassNames[tone]
    )}
  >
    {children}
  </span>
);
