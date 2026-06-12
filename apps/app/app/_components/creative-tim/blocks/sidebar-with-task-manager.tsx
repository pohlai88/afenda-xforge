"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { cn } from "@repo/ui/lib/utils";
import {
  ChevronDown,
  FileIcon,
  FolderOpen,
  LogOut,
  Plus,
  Search,
  Settings,
  Upload,
  User,
} from "lucide-react";
import type { ChangeEvent, DragEvent, ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  taskManagerFiles,
  taskManagerSections,
} from "./sidebar-with-task-manager-data.ts";
import type { TaskManagerTab } from "./sidebar-with-task-manager-types.ts";

const profile = {
  name: "Alex Morgan",
  email: "alex@afenda.app",
  avatar: null as string | null,
};

function TaskManagerUserMenu(): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-2 text-left transition hover:bg-muted"
          type="button"
        >
          <Avatar className="size-9">
            {profile.avatar ? (
              <AvatarImage alt={profile.name} src={profile.avatar} />
            ) : null}
            <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{profile.name}</p>
            <p className="truncate text-muted-foreground text-xs">
              {profile.email}
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TaskManagerFileUpload(): ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedNames, setUploadedNames] = useState<string[]>([]);

  const handleFiles = (fileList: FileList | null): void => {
    if (!fileList) {
      return;
    }

    setUploadedNames((current) => [
      ...current,
      ...Array.from(fileList).map((file) => file.name),
    ]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-xl border border-dashed p-4 text-center transition",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30"
        )}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={onDrop}
      >
        <Upload className="mx-auto mb-2 size-5 text-muted-foreground" />
        <p className="font-medium text-sm">Drag files here</p>
        <p className="text-muted-foreground text-xs">
          or click below to browse
        </p>
        <label className="mt-3 inline-block">
          <input
            className="hidden"
            multiple
            onChange={onInputChange}
            type="file"
          />
          <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border bg-background px-3 font-medium text-sm transition hover:bg-muted">
            Upload files
          </span>
        </label>
      </div>
      {uploadedNames.length > 0 ? (
        <ul className="space-y-1 text-muted-foreground text-xs">
          {uploadedNames.map((name) => (
            <li key={name} className="truncate">{name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TaskManagerSidebarPanel({
  activeTab,
  onTabChange,
  query,
  onQueryChange,
  sections,
  files,
}: {
  activeTab: TaskManagerTab;
  files: typeof taskManagerFiles;
  onQueryChange: (value: string) => void;
  onTabChange: (tab: TaskManagerTab) => void;
  query: string;
  sections: typeof taskManagerSections;
}): ReactElement {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        tasks: section.tasks.filter((task) =>
          task.label.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((section) => section.tasks.length > 0);
  }, [normalizedQuery, sections]);

  const filteredFiles = useMemo(() => {
    if (!normalizedQuery) {
      return files;
    }

    return files.filter((file) =>
      file.name.toLowerCase().includes(normalizedQuery)
    );
  }, [files, normalizedQuery]);

  const showTasks = activeTab === "all" || activeTab === "tasks";
  const showFiles = activeTab === "all" || activeTab === "files";

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground text-xs">
            TM
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <p className="font-semibold text-sm">Task manager</p>
            <p className="text-muted-foreground text-xs">Workspace sidebar</p>
          </div>
        </div>
        <div className="relative group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tasks or files..."
            value={query}
          />
        </div>
        <Tabs
          className="group-data-[collapsible=icon]/sidebar-wrapper:hidden"
          onValueChange={(value) => onTabChange(value as TaskManagerTab)}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
        </Tabs>
      </SidebarHeader>

      <SidebarContent>
        {showTasks ? (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Tasks</span>
              <Button size="icon" type="button" variant="ghost">
                <Plus className="size-4" />
                <span className="sr-only">Add task</span>
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2 px-2">
              {filteredSections.map((section) => (
                <Collapsible defaultOpen key={section.id}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 font-medium text-sm hover:bg-muted">
                    <span className="flex items-center gap-2">
                      <FolderOpen className="size-4 text-muted-foreground" />
                      {section.label}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pb-2 pl-6">
                    {section.tasks.map((task) => (
                      <label
                        className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
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
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {showFiles ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Files</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2 px-2">
                <TaskManagerFileUpload />
                <SidebarMenu>
                  {filteredFiles.map((file) => (
                    <SidebarMenuItem key={file.id}>
                      <SidebarMenuButton className="justify-between">
                        <span className="flex items-center gap-2 truncate">
                          <FileIcon className="size-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <Badge variant="secondary">{file.sizeLabel}</Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        <TaskManagerUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function TaskManagerMainPanel({
  activeTab,
  query,
}: {
  activeTab: TaskManagerTab;
  query: string;
}): ReactElement {
  const openTasks = taskManagerSections
    .flatMap((section) => section.tasks)
    .filter((task) => !task.completed).length;

  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <div>
          <p className="font-semibold text-sm">Project workspace</p>
          <p className="text-muted-foreground text-xs">
            Creative Tim sidebar-with-task-manager block
          </p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Open tasks
            </p>
            <p className="mt-2 font-semibold text-3xl">{openTasks}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Active tab
            </p>
            <p className="mt-2 font-semibold text-3xl capitalize">{activeTab}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Search
            </p>
            <p className="mt-2 font-semibold text-lg">
              {query.trim() ? query : "No filter"}
            </p>
          </div>
        </div>
        <Tabs className="w-full" value={activeTab}>
          <TabsList>
            <TabsTrigger value="all">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task board</TabsTrigger>
            <TabsTrigger value="files">File vault</TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4 rounded-xl border border-border bg-card p-6" value="all">
            <p className="font-medium text-sm">All workspace activity</p>
            <p className="mt-2 text-muted-foreground text-sm">
              Use the sidebar to filter tasks, upload files, and manage your
              profile. This block mirrors the Creative Tim task-management
              sidebar pattern inside your authenticated workspace shell.
            </p>
          </TabsContent>
          <TabsContent className="mt-4 rounded-xl border border-border bg-card p-6" value="tasks">
            <p className="font-medium text-sm">Task sections</p>
            <ul className="mt-3 space-y-2 text-sm">
              {taskManagerSections.flatMap((section) =>
                section.tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-2">
                    <Checkbox checked={task.completed} />
                    {task.label}
                  </li>
                ))
              )}
            </ul>
          </TabsContent>
          <TabsContent className="mt-4 rounded-xl border border-border bg-card p-6" value="files">
            <p className="font-medium text-sm">Shared files</p>
            <ul className="mt-3 space-y-2 text-sm">
              {taskManagerFiles.map((file) => (
                <li key={file.id} className="flex justify-between gap-3">
                  <span>{file.name}</span>
                  <span className="text-muted-foreground">{file.sizeLabel}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}

export function SidebarWithTaskManager(): ReactElement {
  const [activeTab, setActiveTab] = useState<TaskManagerTab>("all");
  const [query, setQuery] = useState("");

  return (
    <SidebarProvider className="min-h-[720px] rounded-xl border border-border bg-background">
      <TaskManagerSidebarPanel
        activeTab={activeTab}
        files={taskManagerFiles}
        onQueryChange={setQuery}
        onTabChange={setActiveTab}
        query={query}
        sections={taskManagerSections}
      />
      <TaskManagerMainPanel activeTab={activeTab} query={query} />
    </SidebarProvider>
  );
}
