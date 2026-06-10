import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  ButtonActionRenderer,
  DestructiveActionRenderer,
  MenuActionRenderer,
} from "../src/renderers/actions";
import { BaseActionRenderer } from "../src/renderers/actions/base-action.renderer";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const context = createMetadataRenderContext(undefined, {
  mode: "read",
});

const expandActionTree = (node: ReactNode): ReactNode => {
  if (Array.isArray(node)) {
    return node.map((child) => expandActionTree(child));
  }

  if (!node || typeof node !== "object" || !("type" in node)) {
    return node;
  }

  const element = node as TestElement;

  if (
    element.type === ButtonActionRenderer ||
    element.type === DestructiveActionRenderer ||
    element.type === MenuActionRenderer ||
    element.type === BaseActionRenderer
  ) {
    return expandActionTree(element.type(element.props));
  }

  return {
    ...element,
    props: {
      ...element.props,
      children: expandActionTree(element.props.children),
    },
  };
};

test("button action renderer hardens blank target links", () => {
  const element = expandActionTree(
    ButtonActionRenderer({
      action: {
        kind: "create",
        key: "docs",
        label: "Docs",
        href: "https://example.com",
        target: "_blank",
      },
      context,
    })
  ) as TestElement;

  const anchor = ((): TestElement | undefined => {
    const walk = (node: ReactNode): TestElement | undefined => {
      if (Array.isArray(node)) {
        for (const child of node) {
          const match = walk(child);
          if (match) {
            return match;
          }
        }

        return;
      }

      if (!node || typeof node !== "object" || !("type" in node)) {
        return;
      }

      const candidate = node as TestElement;
      if (candidate.type === "a") {
        return candidate;
      }

      return walk(candidate.props.children);
    };

    return walk(element);
  })();

  assert.equal(anchor?.type, "a");
  assert.equal(anchor?.props.target, "_blank");
  assert.equal(anchor?.props.rel, "noopener noreferrer");
});

test("menu action renderer marks popup intent", () => {
  const element = expandActionTree(
    MenuActionRenderer({
      action: {
        kind: "create",
        key: "more",
        label: "More",
      },
      context,
    })
  ) as TestElement;

  const button = ((): TestElement | undefined => {
    const walk = (node: ReactNode): TestElement | undefined => {
      if (Array.isArray(node)) {
        for (const child of node) {
          const match = walk(child);
          if (match) {
            return match;
          }
        }

        return;
      }

      if (!node || typeof node !== "object" || !("type" in node)) {
        return;
      }

      const candidate = node as TestElement;
      if (candidate.props?.["data-action-surface"] === "menu") {
        return candidate;
      }

      return walk(candidate.props.children);
    };

    return walk(element);
  })();

  assert.equal(button?.props["aria-haspopup"], "menu");
  assert.equal(button?.props.variant, "ghost");
});

test("confirmation blocks destructive action execution until confirmed", () => {
  let called = false;

  const element = expandActionTree(
    DestructiveActionRenderer({
      action: {
        kind: "delete",
        key: "delete",
        label: "Delete",
      },
      context,
      onAction: (): void => {
        called = true;
      },
    })
  ) as TestElement;

  const trigger = ((): TestElement | undefined => {
    const walk = (node: ReactNode): TestElement | undefined => {
      if (Array.isArray(node)) {
        for (const child of node) {
          const match = walk(child);
          if (match) {
            return match;
          }
        }

        return;
      }

      if (!node || typeof node !== "object" || !("type" in node)) {
        return;
      }

      const candidate = node as TestElement;
      if (candidate.props?.["data-action-surface"] === "destructive") {
        return candidate;
      }

      return walk(candidate.props.children);
    };

    return walk(element);
  })();

  assert.equal(typeof trigger?.props?.onClick, "undefined");
  assert.equal(called, false);
});
