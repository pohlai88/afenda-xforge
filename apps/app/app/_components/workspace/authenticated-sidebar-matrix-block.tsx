"use client";

import {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@repo/ui";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import { Link2, Paperclip, Plus } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";

type MatrixQuadrant = "urgent" | "important" | "urgent-important";

type MatrixTask = {
  id: string;
  label: string;
  labelColor: string;
  note?: string;
  url?: string;
};

const presetColors = [
  { id: "rose", className: "bg-rose-500" },
  { id: "amber", className: "bg-amber-500" },
  { id: "emerald", className: "bg-emerald-500" },
  { id: "violet", className: "bg-violet-500" },
  { id: "sky", className: "bg-sky-500" },
];

const quadrantCards: Record<
  MatrixQuadrant,
  { tab: string; title: string; hint: string }
> = {
  urgent: {
    tab: "Urgent",
    title: "Urgent",
    hint: "Time-sensitive",
  },
  important: {
    tab: "Important",
    title: "Important",
    hint: "Strategic",
  },
  "urgent-important": {
    tab: "Both",
    title: "Urgent + important",
    hint: "Do now",
  },
};

const seedTasks: Record<MatrixQuadrant, MatrixTask[]> = {
  urgent: [{ id: "u-1", label: "Client escalation", labelColor: "bg-rose-500" }],
  important: [
    { id: "i-1", label: "Quarterly planning", labelColor: "bg-emerald-500" },
  ],
  "urgent-important": [
    { id: "ui-1", label: "Release sign-off", labelColor: "bg-amber-500" },
  ],
};

export function AuthenticatedSidebarMatrixBlock(): ReactElement {
  const [tab, setTab] = useState<MatrixQuadrant>("urgent-important");
  const [tasks, setTasks] = useState(seedTasks);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [labelColor, setLabelColor] = useState(presetColors[0].className);
  const [customColors, setCustomColors] = useState<string[]>([]);

  const allColors = [
    ...presetColors,
    ...customColors.map((className, index) => ({
      id: `custom-${index}`,
      className,
    })),
  ];

  const addTask = (): void => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    setTasks((current) => ({
      ...current,
      [tab]: [
        ...current[tab],
        {
          id: `${tab}-${Date.now()}`,
          label: trimmed,
          labelColor,
          note: note.trim() || undefined,
          url: url.trim() || undefined,
        },
      ],
    }));
    setTitle("");
    setNote("");
    setUrl("");
  };

  const addCustomColor = (): void => {
    const value = labelColor.trim();
    if (!value || allColors.some((color) => color.className === value)) {
      return;
    }
    setCustomColors((current) => [...current, value]);
  };

  return (
    <div className="min-w-0 max-w-full space-y-2 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent/20 p-2">
      <p className={cn(WORKSPACE_SHELL_TYPE.navItem, "px-1")}>
        Eisenhower matrix
      </p>

      <Tabs
        onValueChange={(value) => setTab(value as MatrixQuadrant)}
        value={tab}
      >
        <TabsList className="grid h-8 min-w-0 w-full grid-cols-3 gap-0.5 p-0.5">
          {(Object.keys(quadrantCards) as MatrixQuadrant[]).map((quadrant) => (
            <TabsTrigger
              className="h-7 px-1 text-[10px]"
              key={quadrant}
              value={quadrant}
            >
              {quadrantCards[quadrant].tab}
              <span className="ml-1 tabular-nums text-muted-foreground">
                {tasks[quadrant].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(quadrantCards) as MatrixQuadrant[]).map((quadrant) => (
          <TabsContent className="mt-2 space-y-1" key={quadrant} value={quadrant}>
            <div
              className={cn(
                WORKSPACE_SHELL_SPACE.navRow,
                "rounded-md border border-sidebar-border bg-sidebar px-2 py-2"
              )}
            >
              <p className="font-medium text-xs">{quadrantCards[quadrant].title}</p>
              <p className="text-[10px] text-muted-foreground">
                {quadrantCards[quadrant].hint}
              </p>
              <ul className="mt-2 space-y-1">
                {tasks[quadrant].slice(0, 3).map((task) => (
                  <li
                    className="flex items-center gap-1.5 text-xs"
                    key={task.id}
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        task.labelColor
                      )}
                    />
                    <span className="truncate">{task.label}</span>
                  </li>
                ))}
                {tasks[quadrant].length === 0 ? (
                  <li className="text-[10px] text-muted-foreground">No items</li>
                ) : null}
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="min-w-0 space-y-1.5 px-0.5">
        <Input
          className="h-8 text-xs"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Quick capture title"
          value={title}
        />
        <Textarea
          className="min-h-[48px] text-xs"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note"
          rows={2}
          value={note}
        />
        <div className="flex min-w-0 items-center gap-1">
          <Link2 className="size-3 shrink-0 text-muted-foreground" />
          <Input
            className="h-8 min-w-0 flex-1 text-xs"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://"
            value={url}
          />
        </div>
        <label
          className="flex cursor-pointer items-center gap-1.5 text-[10px] text-muted-foreground"
        >
          <Paperclip className="size-3" />
          <span>Attach file (scaffold)</span>
          <input className="hidden" type="file" />
        </label>

        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {allColors.map((color) => (
            <button
              className={cn(
                "size-5 shrink-0 rounded-full ring-offset-1 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                color.className,
                labelColor === color.className && "ring-2 ring-ring"
              )}
              key={color.id}
              onClick={() => setLabelColor(color.className)}
              type="button"
            />
          ))}
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <Input
            className="h-7 min-w-0 flex-1 text-[10px]"
            onChange={(event) => setLabelColor(event.target.value)}
            placeholder="custom"
            value={labelColor}
          />
          <Button
            className="h-7 shrink-0 px-2 text-[10px]"
            onClick={addCustomColor}
            type="button"
            variant="outline"
          >
            Save color
          </Button>
        </div>

        <Button className="h-8 w-full text-xs" onClick={addTask} type="button">
          <Plus className="size-3.5" />
          Add to {quadrantCards[tab].title}
        </Button>
      </div>
    </div>
  );
}
