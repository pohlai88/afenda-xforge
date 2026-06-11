"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@repo/ui/lib/utils";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useId, useState } from "react";
import {
  getAppNavTopbarUtilityDefinition,
  isAppNavTopbarUtilityId,
  renderAppNavTopbarUtilityIcon,
  type AppNavTopbarUtilityId,
} from "./app-nav-topbar-utility-actions.catalog.ts";

function useUtilitySortableSensors(): ReturnType<typeof useSensors> {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );
}

export function AppNavTopbarHorizontalUtilitySortable({
  ids,
  onReorder,
  children,
}: {
  ids: readonly AppNavTopbarUtilityId[];
  onReorder: (
    activeId: AppNavTopbarUtilityId,
    overId: AppNavTopbarUtilityId
  ) => void;
  children: ReactNode;
}): ReactElement {
  const dndContextId = useId();
  const sensors = useUtilitySortableSensors();
  const [activeId, setActiveId] = useState<AppNavTopbarUtilityId | null>(null);

  const handleDragStart = (event: DragStartEvent): void => {
    const id = String(event.active.id);

    if (!isAppNavTopbarUtilityId(id)) {
      return;
    }

    setActiveId(id);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (
      !isAppNavTopbarUtilityId(activeId) ||
      !isAppNavTopbarUtilityId(overId)
    ) {
      return;
    }

    onReorder(activeId, overId);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      id={dndContextId}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext items={[...ids]} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 160 }}>
        {activeId ? (
          <div
            className="flex items-center gap-2 rounded-md border border-primary/40 bg-popover px-2 py-1.5 shadow-lg ring-2 ring-primary/30"
          >
            <span className="text-muted-foreground">
              {renderAppNavTopbarUtilityIcon(activeId)}
            </span>
            <span className="font-medium text-sm">
              {getAppNavTopbarUtilityDefinition(activeId).label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function AppNavTopbarVerticalUtilitySortable({
  ids,
  onReorder,
  children,
}: {
  ids: readonly AppNavTopbarUtilityId[];
  onReorder: (
    activeId: AppNavTopbarUtilityId,
    overId: AppNavTopbarUtilityId
  ) => void;
  children: ReactNode;
}): ReactElement {
  const dndContextId = useId();
  const sensors = useUtilitySortableSensors();
  const [activeId, setActiveId] = useState<AppNavTopbarUtilityId | null>(null);

  const handleDragStart = (event: DragStartEvent): void => {
    const id = String(event.active.id);

    if (!isAppNavTopbarUtilityId(id)) {
      return;
    }

    setActiveId(id);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (
      !isAppNavTopbarUtilityId(activeId) ||
      !isAppNavTopbarUtilityId(overId)
    ) {
      return;
    }

    onReorder(activeId, overId);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      id={dndContextId}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext items={[...ids]} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 160 }}>
        {activeId ? (
          <div
            className="flex items-center gap-3 rounded-md border border-primary/40 bg-popover px-3 py-2 shadow-lg ring-2 ring-primary/30"
          >
            <span className="text-muted-foreground">
              {renderAppNavTopbarUtilityIcon(activeId)}
            </span>
            <span className="font-medium text-sm">
              {getAppNavTopbarUtilityDefinition(activeId).label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function AppNavTopbarSortableHorizontalItem({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: AppNavTopbarUtilityId;
}): ReactElement {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        "inline-flex touch-none rounded-md",
        isDragging && "opacity-40",
        className
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function AppNavTopbarSortableVerticalItem({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: AppNavTopbarUtilityId;
}): ReactElement {
  const {
    attributes,
    isDragging,
    isOver,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      className={cn(
        "rounded-md touch-none",
        isDragging && "opacity-40",
        isOver && "bg-accent/60 ring-1 ring-primary/30",
        className
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </li>
  );
}
