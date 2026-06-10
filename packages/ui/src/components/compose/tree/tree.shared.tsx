"use client";

import type { ItemInstance } from "@headless-tree/core";
import type { ClassValue } from "clsx";
import { Slot } from "radix-ui";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
} from "react";
import { createContext, useContext } from "react";

import { cn } from "../../../lib/utils";
import { IconPlaceholder } from "./icon-placeholder";

type ToggleIconType = "chevron" | "plus-minus";

interface TreeLike<T> {
  getContainerProps?: (treeLabel?: string) => HTMLAttributes<HTMLDivElement>;
  getDragLineStyle?: () => CSSProperties;
  getItems: () => ItemInstance<T>[];
}

interface TreeContextValue {
  indent: number;
  currentItem?: ItemInstance<unknown>;
  tree?: TreeLike<unknown>;
  toggleIconType?: ToggleIconType;
}

const TreeContext = createContext<TreeContextValue>({
  indent: 20,
  currentItem: undefined,
  tree: undefined,
  toggleIconType: "plus-minus",
});

function useTreeContext<T = unknown>() {
  return useContext(TreeContext) as TreeContextValue & {
    currentItem?: ItemInstance<T>;
    tree?: TreeLike<T>;
  };
}

function composeEventHandlers<E>(
  first?: (event: E) => unknown,
  second?: (event: E) => unknown,
) {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return (event: E) => {
    first(event);

    if (
      event &&
      typeof event === "object" &&
      "defaultPrevented" in event &&
      (event as { defaultPrevented?: boolean }).defaultPrevented
    ) {
      return;
    }

    second(event);
  };
}

function mergeProps(
  baseProps: Record<string, unknown>,
  nextProps: Record<string, unknown>,
) {
  const merged: Record<string, unknown> = { ...baseProps };

  for (const [key, nextValue] of Object.entries(nextProps)) {
    const baseValue = merged[key];

    if (key === "className") {
      merged[key] = cn(baseValue as ClassValue, nextValue as ClassValue);
      continue;
    }

    if (key === "style") {
      merged[key] = { ...(baseValue ?? {}), ...(nextValue ?? {}) };
      continue;
    }

    if (
      key.startsWith("on") &&
      typeof baseValue === "function" &&
      typeof nextValue === "function"
    ) {
      merged[key] = composeEventHandlers(
        baseValue as (event: unknown) => unknown,
        nextValue as (event: unknown) => unknown,
      );
      continue;
    }

    merged[key] = nextValue;
  }

  return merged;
}

interface TreeProps<T = unknown> extends HTMLAttributes<HTMLDivElement> {
  indent?: number;
  tree?: TreeLike<T>;
  toggleIconType?: ToggleIconType;
  asChild?: boolean;
}

function Tree<T = unknown>({
  indent = 20,
  tree,
  className,
  toggleIconType = "chevron",
  asChild = false,
  ...props
}: TreeProps<T>) {
  const containerProps: HTMLAttributes<HTMLDivElement> =
    tree && typeof tree.getContainerProps === "function"
      ? tree.getContainerProps(
          typeof (props as Record<string, unknown>)["aria-label"] === "string"
            ? ((props as Record<string, unknown>)["aria-label"] as string)
            : undefined,
        )
      : {};
  const mergedProps = mergeProps(
    props as Record<string, unknown>,
    containerProps as Record<string, unknown>,
  );
  const {
    style: propStyle,
    className: containerClassName,
    ...otherProps
  } = mergedProps;
  const mergedStyle = {
    ...(propStyle ?? {}),
    "--tree-indent": `${indent}px`,
  } as CSSProperties;

  const Comp = asChild ? Slot.Root : "div";

  return (
    <TreeContext.Provider
      value={{ indent, tree: tree as TreeLike<unknown>, toggleIconType }}
    >
      <Comp
        data-slot="tree"
        style={mergedStyle}
        className={cn(
          "flex flex-col",
          className,
          containerClassName as ClassValue,
        )}
        {...otherProps}
      />
    </TreeContext.Provider>
  );
}

interface TreeItemProps<T = unknown>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "indent"> {
  item: ItemInstance<T>;
  indent?: number;
  asChild?: boolean;
}

function TreeItem<T = unknown>({
  item,
  indent: itemIndent,
  className,
  asChild = false,
  children,
  ...props
}: TreeItemProps<T>) {
  const parentContext = useTreeContext<T>();
  const { indent } = parentContext;
  const resolvedIndent = itemIndent ?? indent;

  const itemProps = typeof item.getProps === "function" ? item.getProps() : {};
  const mergedProps = mergeProps(
    { ...props, children } as Record<string, unknown>,
    itemProps as Record<string, unknown>,
  );
  const {
    style: propStyle,
    className: itemClassName,
    ...otherProps
  } = mergedProps;
  const mergedStyle = {
    ...(propStyle ?? {}),
    "--tree-padding": `${item.getItemMeta().level * resolvedIndent}px`,
  } as CSSProperties;

  const itemName =
    typeof item.getItemName === "function" ? item.getItemName() : undefined;
  const accessibleName = itemName?.trim() || "Tree item";

  const defaultProps = {
    "data-slot": "tree-item",
    style: mergedStyle,
    className: cn(
      "z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
      itemClassName as ClassValue,
    ),
    "data-focus":
      typeof item.isFocused === "function"
        ? item.isFocused() || false
        : undefined,
    "data-folder":
      typeof item.isFolder === "function"
        ? item.isFolder() || false
        : undefined,
    "data-selected":
      typeof item.isSelected === "function"
        ? item.isSelected() || false
        : undefined,
    "data-drag-target":
      typeof item.isDragTarget === "function"
        ? item.isDragTarget() || false
        : undefined,
    "data-search-match":
      typeof item.isMatchingSearch === "function"
        ? item.isMatchingSearch() || false
        : undefined,
    "aria-expanded": item.isExpanded(),
    "aria-label": accessibleName,
  };

  const Comp = asChild ? Slot.Root : "button";

  return (
    <TreeContext.Provider
      value={{
        ...parentContext,
        currentItem: item as ItemInstance<unknown>,
      }}
    >
      <Comp {...defaultProps} {...otherProps}>
        {children}
      </Comp>
    </TreeContext.Provider>
  );
}

interface TreeItemLabelProps<T = unknown>
  extends HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>;
  asChild?: boolean;
}

function TreeItemLabel<T = unknown>({
  item: propItem,
  children,
  className,
  asChild = false,
  ...props
}: TreeItemLabelProps<T>) {
  const { currentItem, toggleIconType } = useTreeContext<T>();
  const item = propItem || currentItem;

  if (!item) {
    return null;
  }

  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="tree-item-label"
      className={cn(
        "in-focus-visible:ring-ring/50 bg-background hover:bg-accent in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground in-data-[drag-target=true]:bg-accent flex items-center gap-1 transition-colors not-in-data-[folder=true]:ps-7 in-focus-visible:ring-[3px] in-data-[search-match=true]:bg-blue-50! [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "style-vega:rounded-sm style-maia:rounded-sm style-nova:rounded-sm style-lyra:rounded-none style-mira:rounded-sm",
        "style-vega:py-1.5 style-maia:py-1.5 style-nova:py-1.5 style-lyra:py-1.5 style-mira:py-1",
        "style-vega:px-2 style-maia:px-2 style-nova:px-2 style-lyra:px-2 style-mira:px-1.5",
        "style-vega:text-sm style-maia:text-sm style-nova:text-sm style-lyra:text-xs style-mira:text-xs/relaxed",
        className,
      )}
      {...props}
    >
      {item.isFolder() &&
        (toggleIconType === "plus-minus" ? (
          item.isExpanded() ? (
            <IconPlaceholder
              lucide="MinusIcon"
              tabler="IconMinus"
              hugeicons="MinusSignIcon"
              phosphor="MinusIcon"
              remixicon="RiSubtractLine"
              className="text-muted-foreground size-3.5"
              stroke="currentColor"
              strokeWidth="1"
            />
          ) : (
            <IconPlaceholder
              lucide="PlusIcon"
              tabler="IconPlus"
              hugeicons="PlusSignIcon"
              phosphor="PlusIcon"
              remixicon="RiAddLine"
              className="text-muted-foreground size-3.5"
              stroke="currentColor"
              strokeWidth="1"
            />
          )
        ) : (
          <IconPlaceholder
            lucide="ChevronDownIcon"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
            className="text-muted-foreground size-4 in-aria-[expanded=false]:-rotate-90"
          />
        ))}
      {children ??
        (typeof item.getItemName === "function" ? item.getItemName() : null)}
    </Comp>
  );
}

function TreeDragLine({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { tree } = useTreeContext();

  if (!tree || typeof tree.getDragLineStyle !== "function") {
    return null;
  }

  const dragLine = tree.getDragLineStyle();
  return (
    <div
      style={dragLine}
      className={cn(
        "bg-primary before:bg-background before:border-primary absolute z-30 -mt-px h-0.5 w-[unset] before:absolute before:-top-[3px] before:left-0 before:size-2 before:border-2",
        "style-vega:before:rounded-full style-maia:before:rounded-full style-nova:before:rounded-full style-lyra:before:rounded-none style-mira:before:rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Tree, TreeDragLine, TreeItem, TreeItemLabel };
