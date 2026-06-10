"use client";

import { GripVertical } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "../../ui-shadcn/kanban";
import type { KanbanPatternName } from "./kanban.catalog";
import { kanbanPatternCatalog } from "./kanban.catalog";

type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  owner: string;
  due: string;
};

const demoBoard: Record<string, Task[]> = {
  Backlog: [
    {
      id: "task-auth",
      title: "Add authentication",
      priority: "High",
      owner: "John Doe",
      due: "Jan 10, 2025",
    },
    {
      id: "task-api",
      title: "Create API endpoints",
      priority: "Medium",
      owner: "Jane Smith",
      due: "Jan 15, 2025",
    },
    {
      id: "task-docs",
      title: "Write documentation",
      priority: "Low",
      owner: "Bob Johnson",
      due: "Jan 20, 2025",
    },
  ],
  "In Progress": [
    {
      id: "task-design-system",
      title: "Design system updates",
      priority: "High",
      owner: "Alice Brown",
      due: "Aug 25, 2025",
    },
    {
      id: "task-dark-mode",
      title: "Implement dark mode",
      priority: "Medium",
      owner: "Charlie Wilson",
      due: "Aug 25, 2025",
    },
  ],
  Done: [
    {
      id: "task-setup",
      title: "Setup project",
      priority: "High",
      owner: "Eve Davis",
      due: "Sep 25, 2025",
    },
    {
      id: "task-commit",
      title: "Initial commit",
      priority: "Low",
      owner: "Frank White",
      due: "Sep 20, 2025",
    },
  ],
};

function priorityTone(priority: Task["priority"]) {
  switch (priority) {
    case "High":
      return "destructive-light" as const;
    case "Medium":
      return "primary-light" as const;
    default:
      return "warning-light" as const;
  }
}

function PatternShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function Stage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-muted/20 p-4", className)}>
      {children}
    </div>
  );
}

type TaskCardProps = {
  task: Task;
  asHandle?: boolean;
  isOverlay?: boolean;
} & Omit<React.ComponentProps<typeof KanbanItem>, "value" | "children">;

function TaskCard({
  task,
  asHandle = false,
  isOverlay = false,
  ...props
}: TaskCardProps) {
  const cardContent = (
    <Card>
      <CardContent className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-sm font-medium">{task.title}</span>
          <Badge
            variant={priorityTone(task.priority)}
            size="xs"
            className="pointer-events-none shrink-0 capitalize"
          >
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="line-clamp-1">{task.owner}</span>
          <time className="whitespace-nowrap text-[10px] tabular-nums">
            {task.due}
          </time>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <KanbanItem value={task.id} {...props}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
}

function TaskColumn({
  columnId,
  tasks,
  isOverlay = false,
}: {
  columnId: string;
  tasks: Task[];
  isOverlay?: boolean;
}) {
  return (
    <KanbanColumn value={columnId}>
      <Card className="mb-2.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">{columnId}</span>
            <Badge variant="outline" size="xs">
              {tasks.length}
            </Badge>
          </div>
          <KanbanColumnHandle asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={`Reorder ${columnId} column`}
            >
              <GripVertical />
            </Button>
          </KanbanColumnHandle>
        </CardHeader>
        <CardContent>
          <KanbanColumnContent
            value={columnId}
            className="flex flex-col gap-2.5"
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                asHandle={!isOverlay}
                isOverlay={isOverlay}
              />
            ))}
          </KanbanColumnContent>
        </CardContent>
      </Card>
    </KanbanColumn>
  );
}

function PreviewKanban({ overlay = false }: { overlay?: boolean }) {
  const [board, setBoard] = React.useState(demoBoard);

  return (
    <Kanban
      value={board}
      onValueChange={setBoard}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid auto-rows-fr gap-4 sm:grid-cols-3">
        {Object.entries(board).map(([columnId, items]) => (
          <TaskColumn key={columnId} columnId={columnId} tasks={items} />
        ))}
      </KanbanBoard>
      {overlay ? (
        <KanbanOverlay>
          {({ value, variant }) => {
            if (variant === "column") {
              const columnId = String(value);
              return (
                <TaskColumn
                  columnId={columnId}
                  tasks={board[columnId] ?? []}
                  isOverlay
                />
              );
            }

            const task = Object.values(board)
              .flat()
              .find((item) => item.id === value);

            if (!task) {
              return null;
            }

            return <TaskCard task={task} isOverlay />;
          }}
        </KanbanOverlay>
      ) : null}
    </Kanban>
  );
}

function renderPatternShell(name: KanbanPatternName) {
  const pattern = kanbanPatternCatalog.find((item) => item.name === name);

  if (!pattern) {
    return null;
  }

  return pattern;
}

export function renderKanbanPattern(name: KanbanPatternName) {
  const pattern = renderPatternShell(name);

  if (!pattern) {
    return null;
  }

  switch (name) {
    case "default":
      return (
        <PatternShell title={pattern.title} description={pattern.description}>
          <Stage>
            <PreviewKanban />
          </Stage>
        </PatternShell>
      );
    case "overlay":
      return (
        <PatternShell title={pattern.title} description={pattern.description}>
          <Stage>
            <PreviewKanban overlay />
          </Stage>
        </PatternShell>
      );
    default:
      return null;
  }
}

export { demoBoard, PatternShell, PreviewKanban, priorityTone, Stage };
