import { describe, expect, it } from "vitest";

import {
  mergePresentationDomProps,
  presentationBundleToDomProps,
  resolveMetadataPresentation,
} from "../lib/presentation/resolve-metadata-presentation";

describe("resolveMetadataPresentation", () => {
  it("maps metadata density to design-system data-density attributes", () => {
    const compact = resolveMetadataPresentation({ density: "compact" });
    expect(compact.dataAttributes["data-density"]).toBe("compact");

    const defaultMode = resolveMetadataPresentation({ density: "default" });
    expect(defaultMode.dataAttributes["data-density"]).toBeUndefined();
  });

  it("resolves feature lanes through the module catalog", () => {
    const bundle = resolveMetadataPresentation({
      featureId: "hr-suite.payroll-compensation.periods",
    });

    expect(bundle.cssVariables["--lane-active-id"]).toBe("money");
    expect(bundle.tailwindClasses).toContain("text-lane-active");
  });

  it("merges presentation bundles into DOM props", () => {
    const lane = resolveMetadataPresentation({
      density: "compact",
      featureId: "hr-suite.payroll-compensation.periods",
      tone: "success",
      variant: "default",
      variantFamily: "button",
    });

    const props = presentationBundleToDomProps(lane);

    expect(props["data-density"]).toBe("compact");
    expect(props.className).toContain("bg-primary");
    expect(props.className).toContain("text-success");
    expect(props.style?.["--lane-active-id"]).toBe("money");
  });

  it("deduplicates classes when merging bundles", () => {
    const first = resolveMetadataPresentation({ tone: "success" });
    const second = resolveMetadataPresentation({ tone: "success" });
    const merged = mergePresentationDomProps(first, second);

    expect(
      merged.className?.split(" ").filter((token) => token === "text-success")
        .length
    ).toBe(1);
  });
});
