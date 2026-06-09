import { Badge } from "@repo/ui/components/badge";
import type { ReactElement, ReactNode } from "react";

export type StatusBadgeTone =
  | "danger"
  | "info"
  | "neutral"
  | "success"
  | "warning";

const toneVariants: Record<
  StatusBadgeTone,
  "destructive" | "info" | "neutral" | "success" | "warning"
> = {
  danger: "destructive",
  info: "info",
  neutral: "neutral",
  success: "success",
  warning: "warning",
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusBadgeTone;
};

export function StatusBadge({
  children,
  tone = "neutral",
}: StatusBadgeProps): ReactElement {
  return <Badge variant={toneVariants[tone]}>{children}</Badge>;
}
