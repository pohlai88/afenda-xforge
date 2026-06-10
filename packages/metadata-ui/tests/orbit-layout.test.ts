import { describe, expect, it } from "vitest";

import {
  resolveOrbitLayoutMetrics,
  resolveOrbitNodePinStyle,
  resolveOrbitNodePosition,
} from "../src/visualization/orbit-layout";

describe("resolveOrbitLayoutMetrics", () => {
  it("sizes the stage to fit nodes at the orbit radius", () => {
    const metrics = resolveOrbitLayoutMetrics({
      radius: 270,
      nodeWidth: 160,
      nodeHeight: 88,
      padding: 32,
    });

    expect(metrics.stageSize).toBeGreaterThanOrEqual(270 * 2 + 160 + 32 * 2);
    expect(metrics.center).toBe(metrics.stageSize / 2);
    expect(metrics.outerRingSize).toBeGreaterThan(metrics.innerRingSize);
  });

  it("uses the exact stage formula from radius, node extent, and padding", () => {
    const input = {
      radius: 270,
      nodeWidth: 160,
      nodeHeight: 88,
      padding: 32,
    };
    const metrics = resolveOrbitLayoutMetrics(input);
    const nodeExtent = Math.max(input.nodeWidth, input.nodeHeight);

    expect(metrics.stageSize).toBe(
      input.radius * 2 + nodeExtent + input.padding * 2
    );
  });
});

describe("resolveOrbitNodePosition", () => {
  it("places the first node at the top of the orbit", () => {
    const position = resolveOrbitNodePosition(0, 8, 300);

    expect(position.x).toBeCloseTo(0, 5);
    expect(position.y).toBeCloseTo(-300, 5);
  });
});

describe("resolveOrbitNodePinStyle", () => {
  it("anchors nodes from center without transform conflicts", () => {
    const style = resolveOrbitNodePinStyle(resolveOrbitNodePosition(0, 8, 300));

    expect(style.left).toBe("calc(50% + 0px)");
    expect(style.top).toBe("calc(50% + -300px)");
  });

  it("never sets transform on the pin element", () => {
    const style = resolveOrbitNodePinStyle(resolveOrbitNodePosition(2, 8, 300));

    expect(style).not.toHaveProperty("transform");
    expect(Object.keys(style)).toEqual(["left", "top"]);
  });

  it("rounds offsets to two decimal places as whole-pixel calc strings", () => {
    const style = resolveOrbitNodePinStyle(
      resolveOrbitNodePosition(1, 8, 270)
    );

    expect(style.left).toMatch(/^calc\(50% \+ -?\d+(?:\.\d+)?px\)$/);
    expect(style.top).toMatch(/^calc\(50% \+ -?\d+(?:\.\d+)?px\)$/);
  });
});
