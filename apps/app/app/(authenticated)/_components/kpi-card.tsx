import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import type { DashboardKpiTone } from "@repo/ui";
import type { ReactElement } from "react";

type KpiCardProps = {
  module?: string;
  title: string;
  tone?: DashboardKpiTone;
  value: number | string;
};

const toneClassNames: Record<DashboardKpiTone, string> = {
  danger: "border-destructive/30",
  info: "border-sky-200 dark:border-sky-900",
  primary: "border-primary/20",
  success: "border-emerald-200 dark:border-emerald-900",
  warning: "border-amber-200 dark:border-amber-900",
};

const toneValueClassNames: Record<DashboardKpiTone, string> = {
  danger: "text-destructive",
  info: "text-sky-700 dark:text-sky-300",
  primary: "text-primary",
  success: "text-emerald-700 dark:text-emerald-300",
  warning: "text-amber-700 dark:text-amber-300",
};

export function KpiCard({
  module,
  title,
  tone = "primary",
  value,
}: KpiCardProps): ReactElement {
  return (
    <Card className={`${toneClassNames[tone]} bg-card/95 shadow-sm`}>
      <CardHeader className="space-y-1 pb-3">
        {module ? (
          <CardDescription className="text-xs uppercase tracking-[0.2em]">
            {module}
          </CardDescription>
        ) : null}
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`font-semibold text-3xl tracking-tight ${toneValueClassNames[tone]}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
