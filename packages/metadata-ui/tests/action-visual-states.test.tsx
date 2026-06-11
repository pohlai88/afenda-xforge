import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";
import { EnterpriseDropdownMenu } from "../src/components/enterprise-dropdown-menu";
import type { MetadataActionSurface } from "../src/contracts/action-renderer.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import {
  ACTION_VISUAL_MATRIX,
  ButtonActionRenderer,
  DestructiveActionRenderer,
  MenuActionRenderer,
  requiresActionConfirmation,
  resolveActionVisualDefinition,
} from "../src/renderers/actions";
import { BaseActionRenderer } from "../src/renderers/actions/base-action.renderer";
import { MenuActionSurface } from "../src/renderers/actions/menu-action-surface";
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
    element.type === MenuActionSurface ||
    element.type === EnterpriseDropdownMenu
  ) {
    return expandActionTree(element.type(element.props));
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

const getTypeName = (element: TestElement | undefined): string | undefined =>
  typeof element?.type === "string" ? element.type : element?.type?.name;

test("ACTION_VISUAL_MATRIX distinguishes button, destructive, and menu surfaces", () => {
  const button = resolveActionVisualDefinition("button");
  const destructive = resolveActionVisualDefinition("destructive");
  const menu = resolveActionVisualDefinition("menu");

  assert.equal(button.buttonVariant, "default");
  assert.equal(destructive.buttonVariant, "destructive");
  assert.equal(menu.buttonVariant, "ghost");
  assert.equal(menu.ariaHasPopup, "menu");
  assert.equal(destructive.requiresConfirmation, true);
  assert.equal(Object.keys(ACTION_VISUAL_MATRIX).length, 3);
});

test("action renderers expose surface-specific visual treatments", () => {
  const renderers: Array<{
    renderer: (props: {
      action: {
        key: string;
        kind: "create";
        label: string;
      };
      context: typeof context;
    }) => TestElement;
    surface: MetadataActionSurface;
    variant: string;
  }> = [
    {
      renderer: ButtonActionRenderer,
      surface: "button",
      variant: "default",
    },
    {
      renderer: DestructiveActionRenderer,
      surface: "destructive",
      variant: "destructive",
    },
    {
      renderer: MenuActionRenderer,
      surface: "menu",
      variant: "ghost",
    },
  ];

  for (const { renderer, surface, variant } of renderers) {
    const element = expandActionTree(
      renderer({
        action: {
          key: surface,
          kind: "create",
          label: surface,
        },
        context,
      })
    ) as TestElement;

    const trigger = findElementByProp(
      element,
      (candidate) => candidate.props?.["data-action-surface"] === surface
    );

    assert.ok(
      trigger,
      `${surface} renderer should expose data-action-surface="${surface}"`
    );
    assert.equal(trigger?.props?.variant, variant);

    if (surface === "menu") {
      assert.equal(trigger?.props?.["aria-haspopup"], "menu");
      assert.ok(
        findElementByProp(
          element,
          (candidate) => getTypeName(candidate) === "DropdownMenu"
        ),
        "menu surface should render DropdownMenu"
      );
    }
  }
});

test("destructive actions require AlertDialog confirmation before onAction", () => {
  const action = {
    key: "delete",
    kind: "delete" as const,
    label: "Delete",
  };

  assert.equal(requiresActionConfirmation(action, "destructive"), true);

  const element = expandActionTree(
    DestructiveActionRenderer({
      action,
      context,
      onAction: (): void => undefined,
    })
  ) as TestElement;

  assert.ok(
    findElementByProp(
      element,
      (candidate) => getTypeName(candidate) === "AlertDialog"
    ),
    "destructive actions should render AlertDialog confirmation"
  );

  assert.ok(
    findElementByProp(
      element,
      (candidate) => getTypeName(candidate) === "AlertDialogAction"
    ),
    "destructive confirmation should expose an explicit confirm action"
  );

  const trigger = findElementByProp(
    element,
    (candidate) => candidate.props?.["data-action-surface"] === "destructive"
  );

  assert.equal(trigger?.props?.onClick, undefined);
});

test("primary button actions execute directly without confirmation chrome", () => {
  let called = false;

  const element = expandActionTree(
    ButtonActionRenderer({
      action: {
        key: "save",
        kind: "update",
        label: "Save",
      },
      context,
      onAction: (): void => {
        called = true;
      },
    })
  ) as TestElement;

  assert.equal(
    findElementByProp(
      element,
      (candidate) => getTypeName(candidate) === "AlertDialog"
    ),
    undefined
  );

  const trigger = findElementByProp(
    element,
    (candidate) => candidate.props?.["data-action-surface"] === "button"
  );

  assert.equal(typeof trigger?.props?.onClick, "function");

  trigger?.props?.onClick?.({
    preventDefault: (): void => undefined,
    stopPropagation: (): void => undefined,
  } as never);

  assert.equal(called, true);
});
