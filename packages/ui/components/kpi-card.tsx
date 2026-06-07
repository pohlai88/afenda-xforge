"use client";

import { cn } from "@repo/design-system/lib/utils";
import type {
  DashboardKpiDefinition,
  DashboardKpiTone,
  DashboardKpiTrend,
} from "@repo/metadata";
import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";

type KpiCardProps = DashboardKpiDefinition & {
  icon?: ReactNode;
  description?: string;
  onClick?: () => void;
  sparklineData?: readonly number[];
};

const toneClassNames: Record<
  DashboardKpiTone,
  {
    border: string;
    text: string;
    tint: string;
  }
> = {
  danger: {
    border: "border-red-500/20",
    text: "text-red-700 dark:text-red-300",
    tint: "bg-red-500/10",
  },
  info: {
    border: "border-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-300",
    tint: "bg-cyan-500/10",
  },
  primary: {
    border: "border-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    tint: "bg-blue-500/10",
  },
  success: {
    border: "border-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    tint: "bg-emerald-500/10",
  },
  warning: {
    border: "border-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    tint: "bg-amber-500/10",
  },
};

const trendDecoration: Record<
  DashboardKpiTrend,
  {
    badge: string;
    icon: typeof ArrowUp;
    text: string;
  }
> = {
  down: {
    badge: "bg-red-500/10 text-red-700 dark:text-red-300",
    icon: ArrowDown,
    text: "",
  },
  flat: {
    badge: "bg-muted text-muted-foreground",
    icon: Minus,
    text: "",
  },
  up: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: ArrowUp,
    text: "+",
  },
};

export const KpiCard = ({
  change,
  icon,
  link,
  module,
  description,
  onClick,
  sparklineData,
  title,
  tone = "primary",
  trend = "flat",
  value,
}: KpiCardProps): ReactElement => {
  const toneClassName = toneClassNames[tone];
  const trendConfig = trendDecoration[trend];
  const TrendIcon = trendConfig.icon;
  const isInteractive = Boolean(link || onClick);
  const maxSparklineValue =
    sparklineData && sparklineData.length > 0 ? Math.max(...sparklineData) : 0;
  const minSparklineValue =
    sparklineData && sparklineData.length > 0 ? Math.min(...sparklineData) : 0;
  const sparklineRange = maxSparklineValue - minSparklineValue || 1;
  const sparklineBars =
    sparklineData?.reduce<{
      counts: Map<number, number>;
      items: Array<{
        dataPoint: number;
        key: string;
      }>;
    }>(
      (accumulator, dataPoint) => {
        const occurrence = (accumulator.counts.get(dataPoint) ?? 0) + 1;
        accumulator.counts.set(dataPoint, occurrence);
        accumulator.items.push({
          dataPoint,
          key: `${title}-${dataPoint}-${occurrence}`,
        });
        return accumulator;
      },
      {
        counts: new Map<number, number>(),
        items: [],
      }
    ).items ?? [];

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  const content = (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-muted-foreground text-sm">
            {title}
            {module ? (
              <span className="ml-2 text-muted-foreground/80 text-xs">
                {module}
              </span>
            ) : null}
          </p>
          {description ? (
            <p className="max-w-md text-muted-foreground text-xs leading-5">
              {description}
            </p>
          ) : null}
          <p className={cn("font-semibold text-3xl", toneClassName.text)}>
            {value}
          </p>
        </div>
        {icon ? (
          <div className={cn("shrink-0", toneClassName.text)}>{icon}</div>
        ) : null}
      </div>

      {typeof change === "number" ? (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-xs",
              trendConfig.badge
            )}
          >
            <TrendIcon className="size-3.5" />
            {trendConfig.text}
            {change}%
          </span>
          <span className="text-muted-foreground text-xs">vs last period</span>
        </div>
      ) : null}

      {sparklineBars.length > 0 ? (
        <div className="mt-4 flex items-end gap-1">
          {sparklineBars.map((bar) => {
            const barHeight =
              ((bar.dataPoint - minSparklineValue) / sparklineRange) * 100;

            return (
              <div
                className={cn("min-w-0 flex-1 rounded-sm", toneClassName.text)}
                key={bar.key}
                style={{
                  height: `${Math.max(4, barHeight * 0.6)}px`,
                  opacity: 0.35,
                }}
              />
            );
          })}
        </div>
      ) : null}

      {link && !onClick ? (
        <div className="absolute right-3 bottom-3 text-muted-foreground/70">
          <ArrowRight className="size-4" />
        </div>
      ) : null}
    </>
  );

  if (link && !onClick) {
    return (
      <a
        className={cn(
          "relative block overflow-hidden rounded-md border bg-card p-5 transition-colors hover:bg-accent/40",
          toneClassName.border,
          toneClassName.tint
        )}
        href={link}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        className={cn(
          "relative block w-full overflow-hidden rounded-md border bg-card p-5 text-left transition-colors hover:bg-accent/40",
          toneClassName.border,
          toneClassName.tint
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-card p-5",
        toneClassName.border,
        toneClassName.tint,
        isInteractive && "cursor-pointer transition-colors hover:bg-accent/40"
      )}
    >
      {content}
    </div>
  );
};
