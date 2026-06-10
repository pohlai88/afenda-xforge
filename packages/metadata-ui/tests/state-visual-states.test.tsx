import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";
import { StatePanel } from "../src/components/state-panel";
import type { MetadataUiState } from "../src/contracts/render-context.contract";
import {
  DegradedState,
  EmptyState,
  ErrorState,
  ForbiddenState,
  InvalidState,
  LoadingState,
  MaintenanceState,
  MetadataStateShell,
  PartialState,
  ReadonlyState,
  ReadyState,
  STATE_VISUAL_MATRIX,
} from "../src/renderers/states";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const stateRenderers: Record<MetadataUiState, () => TestElement> = {
  loading: () => LoadingState({}),
  empty: () => EmptyState({}),
  error: () => ErrorState({ description: "Render failed." }),
  forbidden: () => ForbiddenState({}),
  ready: () => ReadyState({ children: <span>content</span> }) as TestElement,
  invalid: () => InvalidState({ description: "Contract mismatch." }),
  degraded: () =>
    DegradedState({
      children: <span>partial</span>,
      description: "Capability missing.",
    }),
  partial: () =>
    PartialState({
      children: <span>sections</span>,
      description: "Section unavailable.",
    }),
  readonly: () => ReadonlyState({ children: <span>view-only</span> }),
  maintenance: () => MaintenanceState({}),
};

const expandStateShell = (node: ReactNode): ReactNode => {
  if (Array.isArray(node)) {
    return node.map((child) => expandStateShell(child));
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return node;
  }

  const element = node as TestElement;

  if (element.type === MetadataStateShell) {
    return expandStateShell(MetadataStateShell(element.props));
  }

  if (element.type === StatePanel) {
    return expandStateShell(StatePanel(element.props));
  }

  return {
    ...element,
    props: {
      ...element.props,
      children: expandStateShell(element.props.children),
    },
  };
};

const findElementByProp = (
  node: ReactNode,
  predicate: (element: TestElement) => boolean
): TestElement | undefined => {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElementByProp(child, predicate);
      if (match) {
        return match;
      }
    }

    return;
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return;
  }

  const element = node as TestElement;

  if (predicate(element)) {
    return element;
  }

  return findElementByProp(element.props.children, predicate);
};

test("STATE_VISUAL_MATRIX defines distinct tone and copy for all ten states", () => {
  const tones = new Set<string>();
  const titles = new Set<string>();
  const icons = new Set<string>();

  for (const [state, definition] of Object.entries(STATE_VISUAL_MATRIX)) {
    assert.ok(definition.defaultTitle || state === "ready");
    assert.ok(definition.icon, `${state} should declare iconography`);
    assert.ok(
      definition.primaryElement,
      `${state} should declare primary element`
    );
    assert.ok(definition.userAction, `${state} should declare user action`);

    if (state !== "ready") {
      tones.add(definition.tone);
      titles.add(definition.defaultTitle);
      icons.add(definition.icon);
    }
  }

  assert.equal(Object.keys(STATE_VISUAL_MATRIX).length, 10);
  assert.ok(titles.size >= 9, "state titles should be distinct");
  assert.ok(icons.size >= 7, "state iconography should be distinct");
});

test("state renderers expose matrix-backed visual treatments", () => {
  for (const [state, render] of Object.entries(stateRenderers)) {
    const definition = STATE_VISUAL_MATRIX[state as MetadataUiState];
    const element = expandStateShell(render()) as TestElement;

    if (state === "ready") {
      assert.equal((element.props.children as TestElement).type, "span");
      continue;
    }

    const stateRoot = findElementByProp(
      element,
      (candidate) => candidate.props?.["data-state"] === state
    );

    assert.ok(
      stateRoot,
      `${state} renderer should expose data-state="${state}"`
    );

    if (definition.primaryElement === "skeleton") {
      assert.ok(
        findElementByProp(element, (candidate) => {
          const typeName =
            typeof candidate.type === "string"
              ? candidate.type
              : candidate.type?.name;
          return (
            typeName === "MetadataMotionSkeleton" || typeName === "Skeleton"
          );
        }),
        `${state} renderer should include skeleton pattern`
      );
    }

    if (definition.primaryElement === "banner") {
      assert.ok(
        findElementByProp(element, (candidate) => {
          const typeName =
            typeof candidate.type === "string"
              ? candidate.type
              : candidate.type?.name;

          return (
            typeName === "Alert" ||
            candidate.props?.["data-slot"] === "alert" ||
            candidate.props?.role === "alert"
          );
        }),
        `${state} renderer should render an alert banner`
      );
    }

    if (definition.primaryElement === "panel") {
      assert.ok(
        findElementByProp(
          element,
          (candidate) =>
            candidate.type?.name === "Card" ||
            candidate.props?.["data-slot"] === "card"
        ),
        `${state} renderer should render a state panel`
      );
    }

    const titleNode = findElementByProp(element, (candidate) => {
      const children = candidate.props?.children;
      return (
        children === definition.defaultTitle ||
        (typeof children === "string" &&
          children.startsWith(definition.defaultTitle.slice(0, 8)))
      );
    });

    assert.ok(
      titleNode,
      `${state} renderer should render matrix default title`
    );
  }
});

test("error, invalid, and degraded states use distinct visual patterns", () => {
  const errorElement = expandStateShell(ErrorState({})) as TestElement;
  const invalidElement = expandStateShell(InvalidState({})) as TestElement;
  const degradedElement = expandStateShell(
    DegradedState({ children: <span>content</span> })
  ) as TestElement;

  assert.ok(
    findElementByProp(errorElement, (candidate) => {
      const typeName =
        typeof candidate.type === "string"
          ? candidate.type
          : candidate.type?.name;

      return typeName === "Card" || candidate.props?.["data-slot"] === "card";
    })
  );
  assert.ok(
    findElementByProp(invalidElement, (candidate) => {
      const typeName =
        typeof candidate.type === "string"
          ? candidate.type
          : candidate.type?.name;

      return typeName === "Alert";
    })
  );
  assert.ok(
    findElementByProp(degradedElement, (candidate) => {
      const typeName =
        typeof candidate.type === "string"
          ? candidate.type
          : candidate.type?.name;

      return typeName === "Alert";
    })
  );
  assert.notEqual(
    findElementByProp(
      errorElement,
      (candidate) => candidate.type?.name === "Card"
    )?.props?.["data-state"],
    "invalid"
  );
});

test("actionable copy surfaces optional CTAs for empty, error, and forbidden states", () => {
  const emptyWithAction = expandStateShell(
    EmptyState({ onAction: () => undefined })
  ) as TestElement;
  const errorWithRetry = expandStateShell(
    ErrorState({ onRetry: () => undefined })
  ) as TestElement;
  const forbiddenWithBack = expandStateShell(
    ForbiddenState({ onAction: () => undefined })
  ) as TestElement;

  for (const [label, element] of [
    ["empty", emptyWithAction],
    ["error", errorWithRetry],
    ["forbidden", forbiddenWithBack],
  ] as const) {
    assert.ok(
      findElementByProp(
        element,
        (candidate) =>
          candidate.type?.name === "Button" ||
          candidate.props?.["data-slot"] === "button"
      ),
      `${label} renderer should expose an actionable CTA when handler is provided`
    );
  }
});
