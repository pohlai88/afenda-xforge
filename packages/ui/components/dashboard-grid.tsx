import { cn } from "@repo/design-system/lib/utils";
import type {
  DashboardWidgetDefinition,
  DashboardWidgetSize,
} from "@repo/metadata";
import type { CSSProperties, ReactElement, ReactNode } from "react";

type DashboardGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "lg" | "md" | "sm";
  responsive?: boolean;
  style?: CSSProperties;
};

const gapClassNames: Record<NonNullable<DashboardGridProps["gap"]>, string> = {
  lg: "gap-6",
  md: "gap-4",
  sm: "gap-3",
};

const columnClassNames: Record<
  NonNullable<DashboardGridProps["columns"]>,
  string
> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

const widgetSizeClassNames: Record<DashboardWidgetSize, string> = {
  lg: "col-span-1 md:col-span-2 lg:col-span-3",
  md: "col-span-1 lg:col-span-2",
  sm: "col-span-1",
  xl: "col-span-1 md:col-span-2 lg:col-span-4",
};

export const DashboardGrid = ({
  children,
  className,
  columns = 3,
  gap = "md",
  responsive = true,
  style,
}: DashboardGridProps): ReactElement => (
  <div
    className={cn(
      "grid",
      responsive ? columnClassNames[columns] : "grid-cols-1",
      gapClassNames[gap],
      className
    )}
    style={style}
  >
    {children}
  </div>
);

type WidgetContainerProps = {
  children: ReactNode;
  className?: string;
  widget: Pick<DashboardWidgetDefinition, "id" | "size">;
};

export const WidgetContainer = ({
  children,
  className,
  widget,
}: WidgetContainerProps): ReactElement => (
  <div
    className={cn(widgetSizeClassNames[widget.size], className)}
    data-widget-id={widget.id}
  >
    {children}
  </div>
);

type ResponsiveDashboardProps = {
  children: ReactNode;
  className?: string;
  gap?: "lg" | "md" | "sm";
};

export const ResponsiveDashboard = ({
  children,
  className,
  gap = "md",
}: ResponsiveDashboardProps): ReactElement => (
  <div className={cn("w-full", className)}>
    <div
      className={cn(
        "grid auto-rows-max grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
        gapClassNames[gap]
      )}
    >
      {children}
    </div>
  </div>
);
