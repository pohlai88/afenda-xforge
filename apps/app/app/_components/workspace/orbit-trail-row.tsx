"use client";

import { Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, Pin } from "lucide-react";
import type { ReactElement } from "react";
import { OrbitPressureDot } from "./orbit-pressure-dot.tsx";
import type { OrbitTrailItem } from "./orbit-trail.ts";
import { formatOrbitTrailAge } from "./orbit-trail.ts";
import {
  WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS,
  WORKSPACE_SIDEBAR_ROW_CLASS,
  WORKSPACE_SIDEBAR_ROW_TEXT_CLASS,
} from "./orbit-trail-sidebar.classes.ts";
import { WORKSPACE_SHELL_FOCUS_WITHIN_INTERACTIVE_CLASS } from "./workspace-shell.classes.ts";

export function OrbitTrailRow({
  item,
  onDone,
  onPin,
}: {
  item: OrbitTrailItem;
  onDone: () => void;
  onPin: () => void;
}): ReactElement {
  return (
    <li
      className={cn(
        WORKSPACE_SIDEBAR_ROW_CLASS,
        "group flex min-w-0 items-center rounded-md pr-1",
        WORKSPACE_SHELL_FOCUS_WITHIN_INTERACTIVE_CLASS
      )}
    >
      <OrbitPressureDot pressure={item.pressure} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          WORKSPACE_SIDEBAR_ROW_TEXT_CLASS
        )}
      >
        {item.title}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS
        )}
      >
        {formatOrbitTrailAge(item.createdAt)}
      </span>
      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <Button
          aria-label={item.pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
          className={cn("size-6", item.pinned && "opacity-100")}
          onClick={onPin}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pin className={cn("size-3", item.pinned && "fill-current")} />
        </Button>
        <Button
          aria-label={`Complete ${item.title}`}
          className="size-6"
          onClick={onDone}
          size="icon"
          type="button"
          variant="ghost"
        >
          <CheckCircle2 className="size-3" />
        </Button>
      </div>
    </li>
  );
}
