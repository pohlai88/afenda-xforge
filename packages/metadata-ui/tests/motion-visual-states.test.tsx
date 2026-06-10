import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";
import { renderMetadataTableCell } from "../src/components/metadata-cell-renderers";
import { MetadataMotionSkeleton } from "../src/components/metadata-motion-skeleton";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  isMetadataSafeTransitionProperty,
  METADATA_DIALOG_MOTION_CLASS,
  METADATA_PULSE_MOTION_CLASS,
  METADATA_SPINNER_MOTION_CLASS,
} from "../src/interaction/motion-visual-contract";
import {
  DestructiveActionRenderer,
  requiresActionConfirmation,
} from "../src/renderers/actions";
import { BaseActionRenderer } from "../src/renderers/actions/base-action.renderer";
import { LoadingState } from "../src/renderers/states/loading-state.renderer";
import { StateVisualIconGlyph } from "../src/renderers/states/state-visual-icons";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const expandActionTree = (node: ReactNode): ReactNode => {
  if (Array.isArray(node)) {
    return node.map((child) => expandActionTree(child));
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return node;
  }

  const element = node as TestElement;

  if (element.type === DestructiveActionRenderer) {
    return expandActionTree(DestructiveActionRenderer(element.props));
  }

  if (element.type === BaseActionRenderer) {
    return expandActionTree(BaseActionRenderer(element.props));
  }

  return {
    ...element,
    props: {
      ...element.props,
      children: expandActionTree(element.props.children),
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

test("motion contract classes honor prefers-reduced-motion", () => {
  assert.match(METADATA_SPINNER_MOTION_CLASS, /animate-spin/);
  assert.match(METADATA_SPINNER_MOTION_CLASS, /motion-reduce:animate-none/);
  assert.match(METADATA_PULSE_MOTION_CLASS, /animate-pulse/);
  assert.match(METADATA_PULSE_MOTION_CLASS, /motion-reduce:animate-none/);
  assert.match(METADATA_DIALOG_MOTION_CLASS, /motion-reduce:animate-none/);
});

test("isMetadataSafeTransitionProperty allows transform and opacity only", () => {
  assert.equal(isMetadataSafeTransitionProperty("opacity"), true);
  assert.equal(isMetadataSafeTransitionProperty("transform"), true);
  assert.equal(isMetadataSafeTransitionProperty("transform, opacity"), true);
  assert.equal(isMetadataSafeTransitionProperty("color"), false);
  assert.equal(isMetadataSafeTransitionProperty("width"), false);
});

test("StateVisualIconGlyph loader uses contract-backed spinner motion", () => {
  const loader = StateVisualIconGlyph({
    icon: "loader",
  }) as TestElement;

  assert.match(String(loader.props.className), /motion-reduce:animate-none/);
  assert.match(String(loader.props.className), /animate-spin/);
});

test("MetadataMotionSkeleton composes pulse motion with reduced-motion fallback", () => {
  const skeleton = MetadataMotionSkeleton({
    className: "h-4 w-full",
  }) as TestElement;

  assert.match(String(skeleton.props.className), /animate-pulse/);
  assert.match(String(skeleton.props.className), /motion-reduce:animate-none/);
});

test("LoadingState renders motion-safe skeleton placeholders", () => {
  const loadingState = LoadingState({
    description: "Loading records",
    title: "Loading",
  }) as TestElement;

  const skeleton = loadingState.props.children.props.children[0] as TestElement;

  assert.equal(skeleton.type, MetadataMotionSkeleton);
});

test("DestructiveActionRenderer applies reduced-motion class to confirmation dialog", () => {
  const actionRenderer = expandActionTree(
    DestructiveActionRenderer({
      action: {
        key: "delete",
        kind: "delete",
        label: "Delete",
      },
      context: createMetadataRenderContext(undefined, { mode: "update" }),
      onAction: (): void => undefined,
    })
  ) as TestElement;

  const dialogContent = findElementByProp(
    actionRenderer,
    (candidate) =>
      candidate.props?.["data-action-confirmation"] === "destructive"
  );

  assert.ok(dialogContent);
  assert.match(
    String(dialogContent?.props.className),
    /motion-reduce:animate-none/
  );
  assert.ok(
    String(dialogContent?.props.className).includes(
      METADATA_DIALOG_MOTION_CLASS
    )
  );
  assert.equal(
    requiresActionConfirmation(
      { key: "delete", kind: "delete", label: "Delete" },
      "destructive"
    ),
    true
  );
});

test("renderMetadataTableCell keeps mailto links free of disallowed transition classes", () => {
  const emailCell = renderMetadataTableCell(
    { key: "email", kind: "email", label: "Email" },
    "hello@example.com",
    createMetadataRenderContext(undefined, { mode: "read" })
  ) as TestElement;

  assert.doesNotMatch(String(emailCell.props.className), /transition-all/);
  assert.doesNotMatch(String(emailCell.props.className), /transition-colors/);
});
