"use client";

import {
  ChevronDown,
  Download,
  Ellipsis,
  FileCode2,
  FileText,
  Folder,
  Image,
  Music2,
  Video,
} from "lucide-react";
import type * as React from "react";

import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { Separator } from "../../ui-shadcn/separator";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

const treeFiles = [
  { name: "app.tsx", icon: FileCode2 },
  { name: "dashboard.tsx", icon: FileCode2 },
  { name: "readme.md", icon: FileText },
] as const;

const assetFiles = [
  { name: "hero.png", icon: Image },
  { name: "intro.mp4", icon: Video },
  { name: "theme.mp3", icon: Music2 },
] as const;

function FileRow({
  name,
  icon: Icon,
}: {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/40">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm">
          <Download className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Ellipsis className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function TreeViewWithFileActions() {
  return (
    <CollapsiblePatternCard
      title="Tree view with file actions"
      description="A file tree that mixes folder disclosure with per-row actions."
    >
      <CollapsibleStage className="items-start">
        <div className="w-full max-w-md rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Folder className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Project files</p>
                <p className="text-sm text-muted-foreground">
                  Folders expand into nested file actions.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Sync
            </Button>
          </div>
          <div className="p-2">
            <CollapsibleRoot defaultOpen className="rounded-lg border">
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Folder className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">src</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="group">
                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-2 pb-2">
                <Separator className="mb-2" />
                <div className="grid gap-1">
                  {treeFiles.map((file) => (
                    <FileRow
                      key={file.name}
                      name={file.name}
                      icon={file.icon}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </CollapsibleRoot>

            <CollapsibleRoot className="mt-2 rounded-lg border">
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Folder className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">assets</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="group">
                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-2 pb-2">
                <Separator className="mb-2" />
                <div className="grid gap-1">
                  {assetFiles.map((file) => (
                    <FileRow
                      key={file.name}
                      name={file.name}
                      icon={file.icon}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </CollapsibleRoot>
          </div>
        </div>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
