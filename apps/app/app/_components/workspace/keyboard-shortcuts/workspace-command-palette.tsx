"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@repo/ui";
import {
  Keyboard,
  PanelLeft,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType, ReactElement } from "react";
import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import type {
  ShortcutActionId,
  WorkspaceShortcutsPayload,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import { CRUD_SHORTCUT_ACTIONS } from "../../../../lib/workspace-shortcuts/contract.ts";
import { PRODUCT_SHORTCUT_DEFINITIONS } from "../../../../lib/workspace-shortcuts/product-defaults.ts";
import { AUTHENTICATED_NAV_ITEMS } from "../../authenticated-workspace-nav.ts";
import { shortcutActionMessageKey } from "./shortcut-i18n.ts";
import { ShortcutKeyDisplay } from "./shortcut-key-display.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";

const WORKSPACE_COMMAND_ACTIONS = [
  "workspace.toggleSidebar",
  "workspace.openShortcutHelp",
] as const satisfies readonly ShortcutActionId[];

const CRUD_ICONS: Partial<
  Record<ShortcutActionId, ComponentType<{ className?: string }>>
> = {
  "crud.cancel": RotateCcw,
  "crud.create": Plus,
  "crud.delete": Trash2,
  "crud.edit": Pencil,
  "crud.save": Save,
};

export function WorkspaceCommandPalette({
  dispatchCrudAction,
  onOpenChange,
  onOpenHelp,
  onToggleSidebar,
  open,
  payload,
}: {
  dispatchCrudAction: (actionId: ShortcutActionId) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenHelp: () => void;
  onToggleSidebar: () => void;
  payload: WorkspaceShortcutsPayload;
}): ReactElement {
  const router = useRouter();
  const t = useTranslations("workspace.keyboardShortcuts");
  const tActions = useTranslations("workspace.keyboardShortcuts.actions");
  const { getFocusedTarget } = useWorkspaceShortcuts();

  const focusedHandlers = getFocusedTarget()?.handlers ?? {};

  const runCommand = (command: () => void): void => {
    onOpenChange(false);
    command();
  };

  const crudCommands = useMemo(
    () =>
      PRODUCT_SHORTCUT_DEFINITIONS.filter((definition) =>
        CRUD_SHORTCUT_ACTIONS.has(definition.actionId)
      ).map((definition) => ({
        actionId: definition.actionId,
        disabled: focusedHandlers[definition.actionId] === undefined,
        label: tActions(shortcutActionMessageKey(definition.actionId)),
        normalized: payload.bindings[definition.actionId].binding.normalized,
      })),
    [focusedHandlers, payload.bindings, tActions]
  );

  const workspaceCommands = useMemo(
    () =>
      WORKSPACE_COMMAND_ACTIONS.map((actionId) => ({
        actionId,
        label: tActions(shortcutActionMessageKey(actionId)),
        normalized: payload.bindings[actionId].binding.normalized,
      })),
    [payload.bindings, tActions]
  );

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandInput placeholder={t("commandPalette.searchPlaceholder")} />
      <CommandList>
        <CommandEmpty>{t("commandPalette.empty")}</CommandEmpty>

        <CommandGroup heading={t("commandPalette.groups.navigation")}>
          {AUTHENTICATED_NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("commandPalette.groups.workspace")}>
          {workspaceCommands.map((command) => (
            <CommandItem
              key={command.actionId}
              onSelect={() =>
                runCommand(() => {
                  if (command.actionId === "workspace.toggleSidebar") {
                    onToggleSidebar();
                    return;
                  }

                  onOpenHelp();
                })
              }
            >
              {command.actionId === "workspace.toggleSidebar" ? (
                <PanelLeft className="size-4" />
              ) : (
                <Keyboard className="size-4" />
              )}
              {command.label}
              <CommandShortcut>
                <ShortcutKeyDisplay normalized={command.normalized} />
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("commandPalette.groups.crud")}>
          {crudCommands.map((command) => {
            const Icon = CRUD_ICONS[command.actionId];

            return (
              <CommandItem
                disabled={command.disabled}
                key={command.actionId}
                onSelect={() =>
                  runCommand(() => dispatchCrudAction(command.actionId))
                }
              >
                {Icon ? <Icon className="size-4" /> : null}
                {command.label}
                <CommandShortcut>
                  <ShortcutKeyDisplay normalized={command.normalized} />
                </CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
