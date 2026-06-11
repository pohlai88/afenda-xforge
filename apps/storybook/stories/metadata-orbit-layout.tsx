"use client";

import {
  resolveOrbitLayoutMetrics,
  resolveOrbitNodePinStyle,
  resolveOrbitNodePosition,
} from "@repo/metadata-ui/visualization/orbit-layout";
import { cn } from "@repo/ui/lib/utils";
import type { CSSProperties, ReactNode } from "react";

const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 88;

export type MetadataOrbitNodeSpec = {
  id: string;
  label: ReactNode;
  subtitle?: ReactNode;
};

type MetadataOrbitStageProps = {
  radius: number;
  nodes: readonly MetadataOrbitNodeSpec[];
  wave?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  className?: string;
  hubClassName?: string;
  children: ReactNode;
};

/**
 * Radial orbit stage with deterministic sizing.
 * Position pins use left/top; card centering stays on an inner wrapper so
 * hover motion never overrides orbital placement.
 */
export function MetadataOrbitStage({
  radius,
  nodes,
  wave = 0,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  className,
  hubClassName,
  children,
}: MetadataOrbitStageProps) {
  const metrics = resolveOrbitLayoutMetrics({
    radius,
    nodeWidth,
    nodeHeight,
  });

  return (
    <div
      className={cn("relative mx-auto w-full max-w-full", className)}
      style={
        {
          "--orbit-stage-size": `${metrics.stageSize}px`,
          minHeight: "var(--orbit-stage-size)",
        } as CSSProperties
      }
    >
      <div
        className="relative mx-auto aspect-square w-full max-w-[var(--orbit-stage-size)] overflow-visible"
        style={{ height: metrics.stageSize, width: metrics.stageSize }}
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          height={metrics.svgSize}
          viewBox={`0 0 ${metrics.svgSize} ${metrics.svgSize}`}
          width={metrics.svgSize}
        >
          <title>Orbit connection guides</title>
          {nodes.map((node, index) => {
            const { x, y } = resolveOrbitNodePosition(
              index,
              nodes.length,
              radius
            );

            return (
              <line
                className="motion-safe:transition-opacity motion-safe:duration-700"
                key={`${node.id}-${wave}`}
                stroke="var(--primary)"
                strokeOpacity={0.18 + (index % 3) * 0.04}
                strokeWidth={1}
                x1={metrics.center}
                x2={metrics.center + x}
                y1={metrics.center}
                y2={metrics.center + y}
              />
            );
          })}
        </svg>

        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/40"
          style={{
            height: metrics.outerRingSize,
            width: metrics.outerRingSize,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 motion-safe:animate-pulse"
          style={{
            height: metrics.innerRingSize,
            width: metrics.innerRingSize,
          }}
        />

        <div
          className={cn(
            "absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2",
            hubClassName
          )}
        >
          {children}
        </div>

        {nodes.map((node, index) => {
          const pinStyle = resolveOrbitNodePinStyle(
            resolveOrbitNodePosition(index, nodes.length, radius)
          );

          return (
            <div
              className="absolute z-10 motion-safe:transition-all motion-safe:duration-500"
              key={`${node.id}-${wave}`}
              style={{
                ...pinStyle,
                transitionDelay: `${index * 45}ms`,
              }}
            >
              <div
                className={cn(
                  "w-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-primary/25 bg-card/80 px-4 py-3 text-center shadow-sm backdrop-blur-md",
                  "hover:border-primary/50 hover:bg-primary/10 motion-safe:transition-colors motion-safe:duration-300"
                )}
                style={{ width: nodeWidth }}
              >
                <div className="mx-auto mb-2 size-2 rounded-full bg-primary shadow-[0_0_24px_var(--primary)]" />
                <p className="font-medium text-sm">{node.label}</p>
                {node.subtitle ? (
                  <p className="mt-1 font-mono text-[0.62rem] text-muted-foreground">
                    {node.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function IntroductionAtmosphere({
  className,
  gridOpacity = 0.3,
}: {
  className?: string;
  gridOpacity?: number;
}) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,var(--primary)/22%,transparent_34%),radial-gradient(circle_at_15%_15%,var(--brand-secondary)/14%,transparent_28%),radial-gradient(circle_at_85%_80%,var(--brand-accent)/13%,transparent_30%)]",
          className
        )}
      />
      <div
        aria-hidden
        className={cn(
          "sb-intro-grid-bg pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)/35_1px,transparent_1px),linear-gradient(to_bottom,var(--border)/35_1px,transparent_1px)]",
          className
        )}
        style={{ opacity: gridOpacity }}
      />
    </>
  );
}
