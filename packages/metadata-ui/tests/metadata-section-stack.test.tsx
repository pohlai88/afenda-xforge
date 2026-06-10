import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import { MetadataSectionStack } from "../src/components";
import type { MetadataSectionContract } from "../src/contracts";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const collectElements = (
  node: ReactNode,
  elements: TestElement[] = []
): TestElement[] => {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectElements(child, elements);
    }

    return elements;
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return elements;
  }

  const element = node as TestElement;
  elements.push(element);
  collectElements(element.props.children, elements);

  return elements;
};

test("MetadataSectionStack lets section renderers own default composition", () => {
  const sections: readonly MetadataSectionContract[] = [
    {
      description: "Profile details",
      fields: [
        {
          key: "name",
          kind: "text",
          label: "Name",
        },
      ],
      key: "profile",
      kind: "form",
      title: "Profile",
    },
  ];

  const element = MetadataSectionStack({
    sections,
  }) as TestElement;
  const elements = collectElements(element);

  assert.equal(element.type, "div");
  assert.equal(
    elements.some(
      (candidate) =>
        typeof candidate.type === "function" &&
        candidate.type.name === "MetadataForm"
    ),
    true
  );
});

test("MetadataSectionStack accepts custom section content resolver overrides", () => {
  const sections: readonly MetadataSectionContract[] = [
    {
      key: "custom",
      kind: "section",
      title: "Custom",
    },
  ];

  const element = MetadataSectionStack({
    resolveSectionContent: () => <div data-testid="custom-child">Override</div>,
    sections,
  }) as TestElement;
  const elements = collectElements(element);

  assert.equal(
    elements.some(
      (candidate) =>
        candidate.type === "div" &&
        candidate.props["data-testid"] === "custom-child"
    ),
    true
  );
});
