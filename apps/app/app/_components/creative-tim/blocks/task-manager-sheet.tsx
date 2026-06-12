"use client";

import {
  Badge,
  Button,
  Checkbox,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { FileIcon, ListTodo } from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  taskManagerFiles,
  taskManagerSections,
} from "./sidebar-with-task-manager-data.ts";
import type { TaskManagerTab } from "./sidebar-with-task-manager-types.ts";

export function TaskManagerSheet(): ReactElement {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TaskManagerTab>("all");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!normalizedQuery) {
      return taskManagerSections;
    }

    return taskManagerSections
      .map((section) => ({
        ...section,
        tasks: section.tasks.filter((task) =>
          task.label.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((section) => section.tasks.length > 0);
  }, [normalizedQuery]);

  const files = useMemo(() => {
    if (!normalizedQuery) {
      return taskManagerFiles;
    }

    return taskManagerFiles.filter((file) =>
      file.name.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button" variant="outline">
        <ListTodo className="size-4" />
        Tasks
      </Button>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>Task manager</SheetTitle>
            <Input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              value={query}
            />
            <Tabs onValueChange={(v) => setTab(v as TaskManagerTab)} value={tab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
            </Tabs>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <Tabs value={tab}>
              <TabsContent className="mt-0 space-y-4" value="all">
                <TaskList sections={sections} />
                <FileList files={files} />
              </TabsContent>
              <TabsContent className="mt-0" value="tasks">
                <TaskList sections={sections} />
              </TabsContent>
              <TabsContent className="mt-0" value="files">
                <FileList files={files} />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function TaskList({
  sections,
}: {
  sections: typeof taskManagerSections;
}): ReactElement {
  return (
    <ul className="space-y-3">
      {sections.map((section) => (
        <li key={section.id}>
          <p className="mb-1 font-medium text-sm">{section.label}</p>
          <ul className="space-y-1">
            {section.tasks.map((task) => (
              <label
                className="flex items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted"
                key={task.id}
              >
                <Checkbox checked={task.completed} />
                <span
                  className={cn(
                    task.completed && "text-muted-foreground line-through"
                  )}
                >
                  {task.label}
                </span>
              </label>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function FileList({
  files,
}: {
  files: typeof taskManagerFiles;
}): ReactElement {
  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li
          className="flex items-center justify-between gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted"
          key={file.id}
        >
          <span className="flex min-w-0 items-center gap-2">
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{file.name}</span>
          </span>
          <Badge variant="secondary">{file.sizeLabel}</Badge>
        </li>
      ))}
    </ul>
  );
}
