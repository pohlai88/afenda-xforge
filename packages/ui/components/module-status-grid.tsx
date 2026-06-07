import { cn } from "@repo/design-system/lib/utils";
import type {
  DashboardModuleHealth,
  DashboardModuleHealthStatus,
} from "@repo/metadata";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { ReactElement } from "react";
import { StatusBadge } from "./status-badge";

type ModuleStatusGridProps = {
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
  modules: readonly DashboardModuleHealth[];
};

const gridColumnClassNames: Record<
  NonNullable<ModuleStatusGridProps["columns"]>,
  string
> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

const statusTone = (
  status: DashboardModuleHealthStatus
): "danger" | "success" | "warning" => {
  if (status === "online") {
    return "success";
  }

  if (status === "offline") {
    return "danger";
  }

  return "warning";
};

const progressBarClassName = (status: DashboardModuleHealthStatus): string => {
  if (status === "online") {
    return "bg-emerald-500";
  }

  if (status === "offline") {
    return "bg-red-500";
  }

  return "bg-amber-500";
};

const StatusIcon = ({
  status,
}: {
  status: DashboardModuleHealthStatus;
}): ReactElement => {
  if (status === "online") {
    return (
      <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-300" />
    );
  }

  if (status === "offline") {
    return <AlertCircle className="size-5 text-red-600 dark:text-red-300" />;
  }

  return <Clock className="size-5 text-amber-600 dark:text-amber-300" />;
};

const formatRelativeTime = (value: Date): string => {
  const diffMs = value.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

export const ModuleStatusGrid = ({
  columns = 3,
  loading = false,
  modules,
}: ModuleStatusGridProps): ReactElement => {
  const moduleStatusSkeletonKeys = [
    "module-status-skeleton-1",
    "module-status-skeleton-2",
    "module-status-skeleton-3",
    "module-status-skeleton-4",
  ] as const;

  if (loading) {
    return (
      <div className={cn("grid gap-4", gridColumnClassNames[columns])}>
        {moduleStatusSkeletonKeys
          .slice(0, Math.max(columns, 3))
          .map((skeletonKey) => (
            <div
              className="h-32 animate-pulse rounded-md border bg-muted/40"
              key={skeletonKey}
            />
          ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridColumnClassNames[columns])}>
      {modules.map((module) => (
        <div className="rounded-md border bg-card p-4" key={module.moduleName}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">{module.moduleName}</p>
              <StatusBadge tone={statusTone(module.status)}>
                {module.status}
              </StatusBadge>
            </div>
            <StatusIcon status={module.status} />
          </div>

          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-xs">Uptime</span>
              <span className="font-medium text-sm">
                {module.uptime.toFixed(1)}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  progressBarClassName(module.status)
                )}
                style={{
                  width: `${Math.max(0, Math.min(100, module.uptime))}%`,
                }}
              />
            </div>

            {typeof module.responseTime === "number" ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs">
                  Response time
                </span>
                <span className="font-medium text-sm">
                  {module.responseTime}ms
                </span>
              </div>
            ) : null}

            {module.lastError ? (
              <div className="rounded-md bg-muted/40 p-2">
                <p className="font-medium text-xs">Last error</p>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                  {module.lastError}
                </p>
                {module.lastErrorTime ? (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {formatRelativeTime(module.lastErrorTime)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {modules.length === 0 ? (
        <div className="col-span-full rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
          No modules found
        </div>
      ) : null}
    </div>
  );
};
