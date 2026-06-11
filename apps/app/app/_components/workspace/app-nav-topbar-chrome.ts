import { WORKSPACE_SHELL_SPACE } from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";

/** Ghost icon control aligned to workspace app topbar chrome. */
export const appNavTopbarGhostIconButtonClassName = cn(
  WORKSPACE_SHELL_SPACE.iconButton,
  "shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
);

/** Avatar dropdown trigger — compact mark inside icon hit target. */
export const appNavTopbarAvatarTriggerClassName = cn(
  WORKSPACE_SHELL_SPACE.iconButton,
  "shrink-0 p-0 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
);

/** Topbar lucide icons — quiet 16px scale per shadcn product chrome guidance. */
export const appNavTopbarIconClassName = "size-4 shrink-0";
