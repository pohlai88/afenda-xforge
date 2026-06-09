import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReactElement } from "react";

import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  ButtonActionRenderer,
  MenuActionRenderer,
} from "../src/renderers/actions";

type TestElement = ReactElement<any, any>;

const context = createMetadataRenderContext(undefined, {
  mode: "read",
});

test("button action renderer hardens blank target links", () => {
  const element = ButtonActionRenderer({
    action: {
      kind: "create",
      key: "docs",
      label: "Docs",
      href: "https://example.com",
      target: "_blank",
    },
    context,
  }) as TestElement;

  const rendered = element.type(element.props) as TestElement;
  const anchor = rendered.props.children as TestElement;

  assert.equal(anchor.type, "a");
  assert.equal(anchor.props.target, "_blank");
  assert.equal(anchor.props.rel, "noopener noreferrer");
});

test("menu action renderer marks popup intent", () => {
  const element = MenuActionRenderer({
    action: {
      kind: "create",
      key: "more",
      label: "More",
    },
    context,
  }) as TestElement;

  const rendered = element.type(element.props) as TestElement;

  assert.equal(rendered.props["aria-haspopup"], "menu");
});

test("confirmation blocks destructive action execution", () => {
  const originalWindow = (
    globalThis as typeof globalThis & {
      window?: { confirm: (message: string) => boolean };
    }
  ).window;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      confirm: (): boolean => false,
    },
  });

  let called = false;
  let prevented = false;
  let stopped = false;

  try {
    const element = ButtonActionRenderer({
      action: {
        confirmationPolicy: {
          message: "Are you sure?",
        },
        kind: "delete",
        key: "delete",
        label: "Delete",
      },
      context,
      onAction: (): void => {
        called = true;
      },
    }) as TestElement;

    const rendered = element.type(element.props) as TestElement;

    rendered.props.onClick({
      preventDefault: (): void => {
        prevented = true;
      },
      stopPropagation: (): void => {
        stopped = true;
      },
    } as never);
  } finally {
    if (originalWindow === undefined) {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: undefined,
      });
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  }

  assert.equal(prevented, true);
  assert.equal(stopped, false);
  assert.equal(called, false);
});
