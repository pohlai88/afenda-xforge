"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Kbd,
  KbdGroup,
  useCommandState,
} from "@repo/ui";
import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Keyboard,
  PanelLeft,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  ScanSearch,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType, MouseEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { WORKSPACE_SEARCH_MIN_QUERY_LENGTH } from "../../../../lib/workspace-search/contract.ts";
import type {
  ShortcutActionId,
  WorkspaceShortcutsPayload,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import { CRUD_SHORTCUT_ACTIONS } from "../../../../lib/workspace-shortcuts/contract.ts";
import { PRODUCT_SHORTCUT_DEFINITIONS } from "../../../../lib/workspace-shortcuts/product-defaults.ts";
import { WORKSPACE_APP_LIVE_NAVIGATION_SURFACES } from "../workspace-app-surfaces.ts";
import { shortcutActionMessageKey } from "./shortcut-i18n.ts";
import { ShortcutKeyDisplay } from "./shortcut-key-display.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";
import { useWorkspaceSearchSuggestions } from "./use-workspace-search-suggestions.ts";

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

type PaletteCommandGroup = "navigation" | "search" | "workspace" | "crud";

function matchesPaletteQuery(label: string, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return label.toLowerCase().includes(normalizedQuery);
}

type PaletteCommand = {
  actionId?: ShortcutActionId;
  description: string;
  disabled?: boolean;
  group: PaletteCommandGroup;
  icon?: ComponentType<{ className?: string }>;
  id: string;
  label: string;
  normalized?: string;
  run: () => void;
};

function preventCommandFocusSteal(event: MouseEvent<HTMLButtonElement>): void {
  event.preventDefault();
}

function CommandPalettePreviewPanel({
  commands,
  crudCommands,
  onRun,
}: {
  commands: PaletteCommand[];
  crudCommands: PaletteCommand[];
  onRun: (command: PaletteCommand) => void;
}): ReactElement {
  const t = useTranslations(
    "workspace.keyboardShortcuts.commandPalette.preview"
  );
  const tGroups = useTranslations(
    "workspace.keyboardShortcuts.commandPalette.groups"
  );
  const tFooter = useTranslations(
    "workspace.keyboardShortcuts.commandPalette.footer"
  );
  const selectedId = useCommandState((state) => state.value);
  const command = commands.find((entry) => entry.id === selectedId) ?? null;
  const Icon = command?.icon;

  return (
    <Card className="flex min-h-[min(360px,50vh)] flex-col gap-0 rounded-none border-0 bg-muted/30 shadow-none">
      <CardHeader className="gap-3 border-b px-5 py-4">
        {command ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{tGroups(command.group)}</Badge>
              {command.disabled ? (
                <Badge variant="outline">{t("disabledBadge")}</Badge>
              ) : null}
            </div>
            <div className="flex items-start gap-3">
              {Icon ? (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
              ) : null}
              <div className="min-w-0 space-y-1">
                <h3 className="font-semibold leading-none">{command.label}</h3>
                <p className="text-muted-foreground text-sm">
                  {command.description}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">{t("emptySelection")}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 px-5 py-4">
        {command?.normalized ? (
          <div className="space-y-1.5">
            <p className="font-medium text-muted-foreground text-xs">
              {t("shortcutLabel")}
            </p>
            <ShortcutKeyDisplay normalized={command.normalized} />
          </div>
        ) : null}
        {command ? (
          <p className="mt-4 text-muted-foreground text-xs">{t("runHint")}</p>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto flex-col gap-3 border-t bg-muted/20 px-5 py-4">
        <p className="font-medium text-muted-foreground text-xs">
          {tFooter("crudTitle")}
        </p>
        <div className="flex flex-wrap gap-2">
          {crudCommands.map((crudCommand) => {
            const CrudIcon = crudCommand.icon;

            return (
              <Button
                aria-label={crudCommand.label}
                className="h-auto min-w-14 flex-col gap-1 px-2 py-2"
                disabled={crudCommand.disabled}
                key={crudCommand.id}
                onClick={() => onRun(crudCommand)}
                onMouseDown={preventCommandFocusSteal}
                size="sm"
                type="button"
                variant="outline"
              >
                {CrudIcon ? <CrudIcon className="size-4" /> : null}
                {crudCommand.normalized ? (
                  <ShortcutKeyDisplay
                    className="[&_kbd]:h-4 [&_kbd]:min-w-4 [&_kbd]:px-1 [&_kbd]:text-[0.6rem]"
                    normalized={crudCommand.normalized}
                  />
                ) : null}
              </Button>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}

function CommandPaletteNavigationFooter(): ReactElement {
  const t = useTranslations(
    "workspace.keyboardShortcuts.commandPalette.footer"
  );

  return (
    <div
      className="flex flex-wrap items-center gap-4 border-t bg-muted/40 px-4 py-2.5 text-muted-foreground text-xs"
      data-cmdk-ignore=""
    >
      <span className="inline-flex items-center gap-2">
        {t("navigate")}
        <KbdGroup>
          <Kbd aria-label={t("navigateUp")}>
            <ArrowUp className="size-3" />
          </Kbd>
          <Kbd aria-label={t("navigateDown")}>
            <ArrowDown className="size-3" />
          </Kbd>
        </KbdGroup>
      </span>
      <span className="inline-flex items-center gap-2">
        {t("run")}
        <Kbd aria-label={t("run")}>
          <CornerDownLeft className="size-3" />
        </Kbd>
      </span>
      <span className="inline-flex items-center gap-2">
        {t("close")}
        <Kbd>Esc</Kbd>
      </span>
    </div>
  );
}

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
  const tPreview = useTranslations(
    "workspace.keyboardShortcuts.commandPalette.preview"
  );
  const { getFocusedTarget } = useWorkspaceShortcuts();
  const [searchQuery, setSearchQuery] = useState("");
  const hasActiveSearch =
    searchQuery.trim().length >= WORKSPACE_SEARCH_MIN_QUERY_LENGTH;
  const { available, loading, results } = useWorkspaceSearchSuggestions(
    searchQuery,
    open
  );

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const focusedHandlers = getFocusedTarget()?.handlers ?? {};

  const runCommand = (command: () => void): void => {
    onOpenChange(false);
    command();
  };

  const commands = useMemo(() => {
    const navigationCommands: PaletteCommand[] =
      WORKSPACE_APP_LIVE_NAVIGATION_SURFACES.map((surface) => ({
        id: `navigation:${surface.href}`,
        group: "navigation",
        label: surface.label,
        description: surface.description ?? tPreview("navigationDescription"),
        icon: surface.icon,
        run: () => router.push(surface.href),
      }));

    const workspaceCommands: PaletteCommand[] = WORKSPACE_COMMAND_ACTIONS.map(
      (actionId) => {
        const icon =
          actionId === "workspace.toggleSidebar" ? PanelLeft : Keyboard;
        const description =
          actionId === "workspace.toggleSidebar"
            ? tPreview("workspaceToggleSidebar")
            : tPreview("workspaceOpenHelp");

        return {
          actionId,
          id: `workspace:${actionId}`,
          group: "workspace",
          label: tActions(shortcutActionMessageKey(actionId)),
          description,
          icon,
          normalized: payload.bindings[actionId].binding.normalized,
          run: () => {
            if (actionId === "workspace.toggleSidebar") {
              onToggleSidebar();
              return;
            }

            onOpenHelp();
          },
        };
      }
    );

    const crudCommands: PaletteCommand[] = PRODUCT_SHORTCUT_DEFINITIONS.filter(
      (definition) => CRUD_SHORTCUT_ACTIONS.has(definition.actionId)
    ).map((definition) => {
      const disabled = focusedHandlers[definition.actionId] === undefined;

      return {
        actionId: definition.actionId,
        id: `crud:${definition.actionId}`,
        group: "crud",
        label: tActions(shortcutActionMessageKey(definition.actionId)),
        description: disabled
          ? t("crud.noFocusedRecord")
          : tPreview("crudDescription"),
        disabled,
        icon: CRUD_ICONS[definition.actionId],
        normalized: payload.bindings[definition.actionId].binding.normalized,
        run: () => dispatchCrudAction(definition.actionId),
      };
    });

    return [...navigationCommands, ...workspaceCommands, ...crudCommands];
  }, [
    dispatchCrudAction,
    focusedHandlers,
    onOpenHelp,
    onToggleSidebar,
    payload.bindings,
    router,
    t,
    tActions,
    tPreview,
  ]);

  const crudCommands = useMemo(
    () => commands.filter((command) => command.group === "crud"),
    [commands]
  );

  const searchCommands = useMemo<PaletteCommand[]>(
    () =>
      results.map((result) => ({
        id: `search:${result.indexKey}:${result.id}`,
        group: "search",
        label: result.title,
        description:
          result.description ??
          tPreview("searchDescription", { index: result.indexLabel }),
        disabled: !result.href,
        icon: ScanSearch,
        run: () => {
          if (result.href) {
            router.push(result.href);
          }
        },
      })),
    [results, router, tPreview]
  );

  const filteredStaticCommands = useMemo(
    () =>
      hasActiveSearch
        ? commands.filter((command) =>
            matchesPaletteQuery(command.label, searchQuery)
          )
        : commands,
    [commands, hasActiveSearch, searchQuery]
  );

  const paletteCommands = useMemo(
    () => [...searchCommands, ...filteredStaticCommands],
    [filteredStaticCommands, searchCommands]
  );

  const navigationCommands = filteredStaticCommands.filter(
    (command) => command.group === "navigation"
  );
  const workspaceCommands = filteredStaticCommands.filter(
    (command) => command.group === "workspace"
  );
  const filteredCrudCommands = filteredStaticCommands.filter(
    (command) => command.group === "crud"
  );
  const showStaticGroups =
    !hasActiveSearch || filteredStaticCommands.length > 0;
  let commandEmptyMessage = t("commandPalette.empty");
  if (loading) {
    commandEmptyMessage = t("commandPalette.searchStatus.searching");
  } else if (hasActiveSearch && !available) {
    commandEmptyMessage = t("commandPalette.searchStatus.unavailable");
  }

  return (
    <CommandDialog
      className="sm:max-w-3xl"
      commandProps={{ shouldFilter: !hasActiveSearch }}
      description={t("commandPalette.dialogDescription")}
      onOpenChange={onOpenChange}
      open={open}
      title={t("commandPalette.dialogTitle")}
    >
      <CommandInput
        onValueChange={setSearchQuery}
        placeholder={t("commandPalette.searchPlaceholder")}
        value={searchQuery}
      />

      <div className="grid min-h-0 border-b md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <CommandList className="max-h-[min(360px,50vh)] border-b md:border-r md:border-b-0">
          <CommandEmpty>{commandEmptyMessage}</CommandEmpty>

          {hasActiveSearch ? (
            <CommandGroup heading={t("commandPalette.groups.search")}>
              {loading && searchCommands.length === 0 ? (
                <div className="px-2 py-3 text-muted-foreground text-sm">
                  {t("commandPalette.searchStatus.searching")}
                </div>
              ) : null}
              {searchCommands.map((command) => (
                <CommandItem
                  disabled={command.disabled}
                  key={command.id}
                  keywords={[command.label, command.description, command.group]}
                  onSelect={() => runCommand(() => command.run())}
                  value={command.id}
                >
                  <ScanSearch className="size-4" />
                  <span className="min-w-0 truncate">{command.label}</span>
                  <CommandShortcut className="truncate">
                    {command.description}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {hasActiveSearch && showStaticGroups ? <CommandSeparator /> : null}

          {showStaticGroups ? (
            <CommandGroup heading={t("commandPalette.groups.navigation")}>
              {navigationCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  keywords={[command.label, command.group]}
                  onSelect={() => runCommand(() => command.run())}
                  value={command.id}
                >
                  {command.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {showStaticGroups ? <CommandSeparator /> : null}

          {showStaticGroups ? (
            <CommandGroup heading={t("commandPalette.groups.workspace")}>
              {workspaceCommands.map((command) => {
                const Icon = command.icon;

                return (
                  <CommandItem
                    key={command.id}
                    keywords={[command.label, command.group]}
                    onSelect={() => runCommand(() => command.run())}
                    value={command.id}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {command.label}
                    {command.normalized ? (
                      <CommandShortcut>
                        <ShortcutKeyDisplay normalized={command.normalized} />
                      </CommandShortcut>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}

          {showStaticGroups ? <CommandSeparator /> : null}

          {showStaticGroups ? (
            <CommandGroup heading={t("commandPalette.groups.crud")}>
              {filteredCrudCommands.map((command) => {
                const Icon = command.icon;

                return (
                  <CommandItem
                    disabled={command.disabled}
                    key={command.id}
                    keywords={[command.label, command.group]}
                    onSelect={() => runCommand(() => command.run())}
                    value={command.id}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {command.label}
                    {command.normalized ? (
                      <CommandShortcut>
                        <ShortcutKeyDisplay normalized={command.normalized} />
                      </CommandShortcut>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
        </CommandList>

        <CommandPalettePreviewPanel
          commands={paletteCommands}
          crudCommands={crudCommands}
          onRun={(command) => runCommand(() => command.run())}
        />
      </div>

      <CommandPaletteNavigationFooter />
    </CommandDialog>
  );
}
