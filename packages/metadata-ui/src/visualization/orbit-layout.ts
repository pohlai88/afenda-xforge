export type OrbitLayoutInput = {
  radius: number;
  nodeWidth: number;
  nodeHeight: number;
  padding?: number;
};

export type OrbitLayoutMetrics = {
  stageSize: number;
  center: number;
  outerRingSize: number;
  innerRingSize: number;
  svgSize: number;
};

export type OrbitNodePosition = {
  x: number;
  y: number;
  angle: number;
};

/**
 * Derives a square stage large enough for orbital nodes without clipping.
 * Keep node dimensions in sync with rendered card size in the UI layer.
 */
export function resolveOrbitLayoutMetrics(
  input: OrbitLayoutInput
): OrbitLayoutMetrics {
  const padding = input.padding ?? 32;
  const nodeExtent = Math.max(input.nodeWidth, input.nodeHeight);
  const stageSize = input.radius * 2 + nodeExtent + padding * 2;
  const center = stageSize / 2;
  const outerRingSize = (input.radius + nodeExtent / 2 + padding * 0.75) * 2;
  const innerRingSize = input.radius * 1.45;

  return {
    stageSize,
    center,
    outerRingSize,
    innerRingSize,
    svgSize: stageSize,
  };
}

export function resolveOrbitNodePosition(
  index: number,
  count: number,
  radius: number
): OrbitNodePosition {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;

  return {
    angle,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

export function resolveOrbitNodePinStyle(position: OrbitNodePosition): {
  left: string;
  top: string;
} {
  const x = Math.round(position.x * 100) / 100;
  const y = Math.round(position.y * 100) / 100;

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
  };
}
