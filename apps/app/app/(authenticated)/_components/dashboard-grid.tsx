import type { ReactElement, ReactNode } from "react";

type DashboardGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "lg" | "md" | "sm";
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

const gapClassNames: Record<NonNullable<DashboardGridProps["gap"]>, string> = {
  lg: "gap-6",
  md: "gap-4",
  sm: "gap-3",
};

export function DashboardGrid({
  children,
  columns = 3,
  gap = "md",
}: DashboardGridProps): ReactElement {
  return (
    <div className={`grid ${columnClassNames[columns]} ${gapClassNames[gap]}`}>
      {children}
    </div>
  );
}
