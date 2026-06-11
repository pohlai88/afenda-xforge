import {
  ArrowDown,
  ArrowUp,
  Bell,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  Settings2,
  Trash,
  Trash2,
} from "lucide-react";
import { createElement } from "react";
import { appNavTopbarIconClassName } from "./app-nav-topbar-chrome.ts";
import type { AppNavTopbarNavActionGroup } from "./app-nav-topbar-nav-actions.tsx";

function icon(Icon: typeof Settings2) {
  return createElement(Icon, { className: appNavTopbarIconClassName });
}

/** shadcn NavActions demo groups for Theme Studio workspace rail preview. */
export const THEME_STUDIO_NAV_ACTION_GROUPS: readonly AppNavTopbarNavActionGroup[] =
  [
    {
      key: "page",
      items: [
        {
          key: "customize-page",
          icon: icon(Settings2),
          label: "Customize Page",
        },
        {
          key: "turn-into-wiki",
          icon: icon(FileText),
          label: "Turn into wiki",
        },
      ],
    },
    {
      key: "document",
      items: [
        { key: "copy-link", icon: icon(Link), label: "Copy Link" },
        { key: "duplicate", icon: icon(Copy), label: "Duplicate" },
        { key: "move-to", icon: icon(CornerUpRight), label: "Move to" },
        {
          key: "move-to-trash",
          destructive: true,
          icon: icon(Trash2),
          label: "Move to Trash",
        },
      ],
    },
    {
      key: "history",
      items: [
        { key: "undo", icon: icon(CornerUpLeft), label: "Undo" },
        {
          key: "view-analytics",
          icon: icon(LineChart),
          label: "View analytics",
        },
        {
          key: "version-history",
          icon: icon(GalleryVerticalEnd),
          label: "Version History",
        },
        {
          key: "show-delete-pages",
          icon: icon(Trash),
          label: "Show delete pages",
        },
        { key: "notifications", icon: icon(Bell), label: "Notifications" },
      ],
    },
    {
      key: "transfer",
      items: [
        { key: "import", icon: icon(ArrowUp), label: "Import" },
        { key: "export", icon: icon(ArrowDown), label: "Export" },
      ],
    },
  ];
