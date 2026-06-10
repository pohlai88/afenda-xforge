import assert from "node:assert/strict";
import type { ReactElement } from "react";

import {
  MetadataForm,
  MetadataPanel,
  MetadataSurface,
  MetadataSurfaceRegion,
  MetadataToolbar,
} from "../src/components";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import type { MetadataSurfaceKind } from "../src/contracts/surface.contract";
import {
  METADATA_SURFACE_HIERARCHY_SLOTS,
  resolveSectionSurfaceKind,
  resolveSurfaceKindProps,
  resolveSurfaceRegionProps,
  resolveSurfaceVisualDefinition,
  SURFACE_VISUAL_MATRIX,
} from "../src/visualization/surface-visual-contract";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const normalizeChildren = (children: unknown): unknown[] => {
  if (children === null || children === undefined) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
};

const expandSurfaceTree = (node: unknown): unknown => {
  if (!node || typeof node !== "object" || !("type" in node)) {
    return node;
  }

  const element = node as TestElement;
  let expanded: unknown = element;

  if (element.type === MetadataSurfaceRegion) {
    expanded = MetadataSurfaceRegion(element.props);
  } else if (element.type === MetadataToolbar) {
    expanded = MetadataToolbar(element.props);
  }

  if (!expanded || typeof expanded !== "object" || !("props" in expanded)) {
    return expanded;
  }

  const expandedElement = expanded as TestElement;
  const children = normalizeChildren(expandedElement.props?.children).map(
    expandSurfaceTree
  );

  return {
    ...expandedElement,
    props: {
      ...expandedElement.props,
      children: children.length === 1 ? children[0] : children,
    },
  };
};

const baseContext = createMetadataRenderContext(undefined, { mode: "read" });

const findElementByProp = (
  node: unknown,
  propName: string,
  propValue: string
): TestElement | undefined => {
  const expandedNode = expandSurfaceTree(node);

  if (
    !expandedNode ||
    typeof expandedNode !== "object" ||
    !("props" in expandedNode)
  ) {
    return;
  }

  const element = expandedNode as TestElement;

  if (element.props?.[propName] === propValue) {
    return element;
  }

  for (const child of normalizeChildren(element.props?.children)) {
    const match = findElementByProp(child, propName, propValue);

    if (match) {
      return match;
    }
  }

  return;
};

const collectRegionOrder = (
  node: unknown,
  kind: MetadataSurfaceKind,
  regions: string[] = []
): string[] => {
  const expandedNode = expandSurfaceTree(node);

  if (
    !expandedNode ||
    typeof expandedNode !== "object" ||
    !("props" in expandedNode)
  ) {
    return regions;
  }

  const element = expandedNode as TestElement;

  if (
    element.props?.["data-surface-kind"] === kind &&
    typeof element.props?.["data-surface-region"] === "string"
  ) {
    regions.push(element.props["data-surface-region"]);
  }

  for (const child of normalizeChildren(element.props?.children)) {
    collectRegionOrder(child, kind, regions);
  }

  return regions;
};

test("SURFACE_VISUAL_MATRIX defines hierarchy for all surface kinds", () => {
  const kinds: MetadataSurfaceKind[] = [
    "list",
    "detail",
    "form",
    "dashboard",
    "workflow",
  ];

  for (const kind of kinds) {
    const definition = resolveSurfaceVisualDefinition(kind);
    assert.deepEqual(definition.hierarchy, METADATA_SURFACE_HIERARCHY_SLOTS);
    assert.ok(definition.primaryRegions.length > 0);
    assert.match(definition.shellClass, /metadata-surface-/);
  }

  assert.notEqual(
    SURFACE_VISUAL_MATRIX.list.primaryRegions.join(","),
    SURFACE_VISUAL_MATRIX.form.primaryRegions.join(",")
  );
});

test("resolveSurfaceRegionProps emits kind and region markers", () => {
  assert.deepEqual(resolveSurfaceKindProps("detail"), {
    "data-surface-kind": "detail",
  });
  assert.deepEqual(resolveSurfaceRegionProps("list", "data-grid"), {
    "data-surface-kind": "list",
    "data-surface-region": "data-grid",
  });
});

test("resolveSectionSurfaceKind maps section kinds to surface kinds", () => {
  assert.equal(resolveSectionSurfaceKind("form"), "form");
  assert.equal(resolveSectionSurfaceKind("table"), "list");
  assert.equal(resolveSectionSurfaceKind("dashboard"), "dashboard");
  assert.equal(resolveSectionSurfaceKind("workflow"), "workflow");
  assert.equal(resolveSectionSurfaceKind("details"), "detail");
});

test("MetadataToolbar composes title, description, and secondary action regions", () => {
  const tree = MetadataToolbar({
    actions: [{ key: "refresh", kind: "custom", label: "Refresh" }],
    context: baseContext,
    description: "Review invoices",
    surfaceKind: "detail",
    title: "Invoice detail",
  });

  const regions = collectRegionOrder(tree, "detail");
  assert.ok(regions.includes("title"));
  assert.ok(regions.includes("description"));
  assert.ok(regions.includes("secondary-actions"));
});

test("MetadataForm composes form hierarchy regions", () => {
  const tree = MetadataForm({
    actions: [{ key: "save", kind: "submit", label: "Save" }],
    description: "Create a customer record",
    fields: [{ key: "name", kind: "text", label: "Name" }],
    title: "New customer",
  });

  const regions = collectRegionOrder(tree, "form");
  assert.ok(regions.includes("title"));
  assert.ok(regions.includes("description"));
  assert.ok(regions.includes("primary"));
  assert.ok(regions.includes("field-groups"));
  assert.ok(regions.includes("secondary-actions"));
});

test("MetadataPanel composes list surface hierarchy over table regions", () => {
  const tree = MetadataPanel({
    metadata: {
      entity: "invoice",
      labels: { plural: "Invoices", singular: "Invoice" },
      table: {
        columns: [{ key: "name", label: "Name" }],
        defaultSort: "name",
      },
      title: "Invoices",
    },
    rows: [{ id: "1", name: "Acme" }],
  });

  const listRegions = collectRegionOrder(tree, "list");
  assert.ok(listRegions.includes("title"));
  assert.ok(listRegions.includes("description"));
  assert.ok(listRegions.includes("primary"));
  assert.deepEqual(resolveSurfaceVisualDefinition("list").primaryRegions, [
    "filters",
    "data-grid",
    "pagination",
  ]);
});

test("MetadataSurface renderer exposes contract-backed hierarchy shell", () => {
  const tree = MetadataSurface({
    context: baseContext,
    surface: {
      description: "Monitor KPIs",
      key: "ops-dashboard",
      kind: "dashboard",
      title: "Operations dashboard",
      version: "1",
    },
  });

  assert.ok(findElementByProp(tree, "data-surface-kind", "dashboard"));
  assert.ok(findElementByProp(tree, "data-surface-region", "primary"));
  assert.ok(findElementByProp(tree, "data-surface-region", "title"));
});

test("MetadataSurfaceRegion emits region markers for nested slots", () => {
  const tree = MetadataSurfaceRegion({
    kind: "workflow",
    region: "step-content",
  }) as TestElement;

  assert.equal(tree.props["data-surface-kind"], "workflow");
  assert.equal(tree.props["data-surface-region"], "step-content");
});
