"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
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
      return "destructive";
    case "Medium":
      return "secondary";
    default:
      return "outline";
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

function PreviewKanban({ overlay = false }: { overlay?: boolean }) {
  const [board, setBoard] = React.useState(demoBoard);

  return (
    <Kanban
      value={board}
      onValueChange={setBoard}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard>
        {Object.entries(board).map(([columnId, items]) => (
          <KanbanColumn key={columnId} value={columnId}>
            <KanbanColumnHandle>
              <span>{columnId}</span>
              <Badge variant="secondary">{items.length}</Badge>
            </KanbanColumnHandle>
            <KanbanColumnContent value={columnId}>
              {items.map((item) => (
                <KanbanItem key={item.id} value={item.id}>
                  <KanbanItemHandle>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.owner} · {item.due}
                      </span>
                    </div>
                  </KanbanItemHandle>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.owner}
                    </span>
                    <Badge variant={priorityTone(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                </KanbanItem>
              ))}
            </KanbanColumnContent>
          </KanbanColumn>
        ))}
      </KanbanBoard>
      {overlay ? (
        <KanbanOverlay className="w-72">
          {({ variant }) =>
            variant === "column" ? (
              <div className="rounded-xl border bg-background p-3 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted" />
                  <div className="h-2 w-12 rounded-full bg-muted" />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="h-3 w-4/5 rounded-full bg-muted" />
                  <div className="h-3 w-2/3 rounded-full bg-muted" />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-background p-3 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-2 w-20 rounded-full bg-muted" />
                  <div className="h-2 w-14 rounded-full bg-muted" />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="h-3 w-5/6 rounded-full bg-muted" />
                  <div className="h-3 w-1/2 rounded-full bg-muted" />
                </div>
              </div>
            )
          }
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
