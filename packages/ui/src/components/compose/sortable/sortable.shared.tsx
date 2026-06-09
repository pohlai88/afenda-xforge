"use client";

import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext as DndSortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type * as React from "react";
import { createContext, useContext, useMemo } from "react";

import { cn } from "../../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

type SortableLayout = "vertical" | "grid" | "nested";

type SortableItemContextValue = {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging: boolean;
  disabled: boolean;
};

const SortableItemContext = createContext<SortableItemContextValue | null>(
  null,
);

function useSortableItemContext() {
  return useContext(SortableItemContext);
}

function getLayoutClasses(layout: SortableLayout) {
  switch (layout) {
    case "grid":
      return "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
    case "nested":
      return "flex flex-col gap-4";
    default:
      return "flex flex-col gap-3";
  }
}

function getLayoutStrategy(layout: SortableLayout) {
  switch (layout) {
    case "grid":
      return rectSortingStrategy;
    default:
      return verticalListSortingStrategy;
  }
}

function Sortable<T>({
  value,
  onValueChange,
  getItemValue,
  layout = "vertical",
  className,
  children,
}: {
  value: readonly T[];
  onValueChange: (value: T[]) => void;
  getItemValue: (item: T) => string;
  layout?: SortableLayout;
  className?: string;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(() => value.map(getItemValue), [getItemValue, value]);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) {
          return;
        }

        const oldIndex = itemIds.indexOf(String(active.id));
        const newIndex = itemIds.indexOf(String(over.id));

        if (oldIndex === -1 || newIndex === -1) {
          return;
        }

        onValueChange(arrayMove([...value], oldIndex, newIndex));
      }}
      sensors={sensors}
    >
      <DndSortableContext items={itemIds} strategy={getLayoutStrategy(layout)}>
        <div
          data-slot="sortable"
          data-layout={layout}
          className={cn(getLayoutClasses(layout), className)}
        >
          {children}
        </div>
      </DndSortableContext>
    </DndContext>
  );
}

function SortableItem({
  value,
  disabled = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: string;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...props.style,
  } as React.CSSProperties;

  return (
    <SortableItemContext.Provider
      value={{
        attributes,
        listeners,
        setActivatorNodeRef,
        isDragging,
        disabled,
      }}
    >
      <div
        ref={setNodeRef}
        data-slot="sortable-item"
        data-value={value}
        data-dragging={isDragging}
        data-disabled={disabled}
        className={cn(
          "rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm transition-[box-shadow,transform,opacity] outline-none data-[dragging=true]:shadow-lg data-[dragging=true]:opacity-90",
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}

function SortableItemHandle({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const context = useSortableItemContext();

  return (
    <button
      ref={context?.setActivatorNodeRef}
      type="button"
      data-slot="sortable-item-handle"
      data-dragging={context?.isDragging}
      data-disabled={context?.disabled}
      aria-label="Drag item"
      disabled={context?.disabled}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...context?.attributes}
      {...context?.listeners}
      {...props}
    >
      {children}
    </button>
  );
}

function SortablePatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { Sortable, SortableItem, SortableItemHandle, SortablePatternCard };
