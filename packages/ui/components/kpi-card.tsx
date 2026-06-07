"use client";

import { cn } from "@repo/design-system/lib/utils";
import type {
  DashboardKpiDefinition,
  DashboardKpiTone,
  DashboardKpiTrend,
} from "@repo/metadata";
import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import { useMemo } from "react";

type KpiCardProps = DashboardKpiDefinition & {
  icon?: ReactNode;
  description?: string;
  onClick?: () => void;
  sparklineData?: readonly number[];
};

const toneClassNames: Record<
  DashboardKpiTone,
  {
    bar: string;
    border: string;
    text: string;
    tint: string;
  }
> = {
  danger: {
    bar: "bg-destructive",
    border: "border-destructive-border",
    text: "text-destructive-muted-foreground",
    tint: "bg-destructive-muted/70",
  },
  info: {
    bar: "bg-info",
    border: "border-info-border",
    text: "text-info-muted-foreground",
    tint: "bg-info-muted/70",
  },
  primary: {
    bar: "bg-primary",
    border: "border-primary/20",
    text: "text-primary",
    tint: "bg-primary/10",
  },
  success: {
    bar: "bg-success",
    border: "border-success-border",
    text: "text-success-muted-foreground",
    tint: "bg-success-muted/70",
  },
  warning: {
    bar: "bg-warning",
    border: "border-warning-border",
    text: "text-warning-muted-foreground",
    tint: "bg-warning-muted/70",
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
    badge: "bg-destructive-muted text-destructive-muted-foreground",
    icon: ArrowDown,
    text: "",
  },
  flat: {
    badge: "bg-muted text-muted-foreground",
    icon: Minus,
    text: "",
  },
  up: {
    badge: "bg-success-muted text-success-muted-foreground",
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
  const sparklineBars = useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) {
      return [];
    }

    let minSparklineValue = sparklineData[0];
    let maxSparklineValue = sparklineData[0];

    for (const dataPoint of sparklineData) {
      if (dataPoint < minSparklineValue) {
        minSparklineValue = dataPoint;
      }

      if (dataPoint > maxSparklineValue) {
        maxSparklineValue = dataPoint;
      }
    }

    const sparklineRange = maxSparklineValue - minSparklineValue || 1;
    const counts = new Map<number, number>();
    const items: Array<{
      key: string;
      height: number;
    }> = [];

    for (const dataPoint of sparklineData) {
      const occurrence = (counts.get(dataPoint) ?? 0) + 1;
      counts.set(dataPoint, occurrence);
      const barHeight =
        ((dataPoint - minSparklineValue) / sparklineRange) * 100;

      items.push({
        key: `${title}-${dataPoint}-${occurrence}`,
        height: Math.max(4, barHeight * 0.6),
      });
    }

    return items;
  }, [sparklineData, title]);

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
          {sparklineBars.map((bar) => (
            <div
              className={cn("min-w-0 flex-1 rounded-sm", toneClassName.bar)}
              key={bar.key}
              style={{
                height: `${bar.height}px`,
                opacity: 0.35,
              }}
            />
          ))}
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
