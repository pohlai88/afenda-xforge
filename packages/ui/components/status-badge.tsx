import type { ReactElement, ReactNode } from "react";
import { Badge } from "./badge";

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

export const StatusBadge = ({
  children,
  tone = "neutral",
}: StatusBadgeProps): ReactElement => (
  <Badge variant={toneVariants[tone]}>{children}</Badge>
);
