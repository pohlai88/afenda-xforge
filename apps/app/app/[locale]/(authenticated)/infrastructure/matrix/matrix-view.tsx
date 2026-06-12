"use client";

import {
  Badge,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@repo/ui";
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

const defaultLabelColors = [
  { id: "rose", className: "bg-rose-500" },
  { id: "amber", className: "bg-amber-500" },
  { id: "emerald", className: "bg-emerald-500" },
  { id: "violet", className: "bg-violet-500" },
];

const seedTasks: Record<MatrixQuadrant, MatrixTask[]> = {
  urgent: [
    {
      id: "u-1",
      label: "Client escalation",
      labelColor: "bg-rose-500",
    },
  ],
  important: [
    {
      id: "i-1",
      label: "Quarterly planning",
      labelColor: "bg-emerald-500",
    },
  ],
  "urgent-important": [
    {
      id: "ui-1",
      label: "Release sign-off",
      labelColor: "bg-amber-500",
    },
  ],
};

const quadrantMeta: Record<
  MatrixQuadrant,
  { title: string; hint: string }
> = {
  urgent: {
    title: "Urgent",
    hint: "Do soon — time-sensitive, not necessarily strategic.",
  },
  important: {
    title: "Important",
    hint: "Strategic work — schedule even when it is not loud.",
  },
  "urgent-important": {
    title: "Urgent + important",
    hint: "Do now — protects outcomes and deadlines.",
  },
};

export function MatrixView(): ReactElement {
  const [tab, setTab] = useState<MatrixQuadrant>("urgent-important");
  const [tasks, setTasks] = useState(seedTasks);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [labelColor, setLabelColor] = useState(defaultLabelColors[0].className);

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

  return (
    <div className="space-y-4">
      <Tabs
        onValueChange={(value) => setTab(value as MatrixQuadrant)}
        value={tab}
      >
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
          <TabsTrigger value="urgent-important">Urgent + important</TabsTrigger>
        </TabsList>

        {(Object.keys(quadrantMeta) as MatrixQuadrant[]).map((quadrant) => (
          <TabsContent key={quadrant} value={quadrant}>
            <MatrixCard
              hint={quadrantMeta[quadrant].hint}
              tasks={tasks[quadrant]}
              title={quadrantMeta[quadrant].title}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-medium text-sm">Quick capture</p>
        <Input
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          value={title}
        />
        <Textarea
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note"
          rows={2}
          value={note}
        />
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          <Input
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://"
            value={url}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-muted-foreground text-sm">
          <Paperclip className="size-4" />
          <span>Attach file (scaffold — not wired)</span>
          <input className="hidden" type="file" />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Label color</span>
          {defaultLabelColors.map((color) => (
            <button
              className={cn(
                "size-6 rounded-full ring-offset-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                color.className,
                labelColor === color.className && "ring-2 ring-ring"
              )}
              key={color.id}
              onClick={() => setLabelColor(color.className)}
              type="button"
            />
          ))}
          <Input
            className="h-8 w-28"
            onChange={(event) => setLabelColor(event.target.value)}
            placeholder="custom class"
            value={labelColor}
          />
        </div>

        <Button onClick={addTask} type="button">
          <Plus className="size-4" />
          Add to {quadrantMeta[tab].title}
        </Button>
      </div>
    </div>
  );
}

function MatrixCard({
  hint,
  tasks,
  title,
}: {
  hint: string;
  tasks: MatrixTask[];
  title: string;
}): ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-muted-foreground text-sm">{hint}</p>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            className="rounded-lg border border-border px-3 py-2"
            key={task.id}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2.5 shrink-0 rounded-full", task.labelColor)}
              />
              <span className="font-medium text-sm">{task.label}</span>
            </div>
            {task.note ? (
              <p className="mt-1 text-muted-foreground text-xs">{task.note}</p>
            ) : null}
            {task.url ? (
              <Badge className="mt-2" variant="secondary">{task.url}</Badge>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
