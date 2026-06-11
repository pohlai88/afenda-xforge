"use client";

import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import {
  Bug,
  GripVertical,
  LayoutDashboard,
  MessageSquareWarning,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { AppNavTopbarNotifications } from "./app-nav-topbar-notifications.tsx";
import {
  AppNavTopbarHorizontalUtilitySortable,
  AppNavTopbarSortableHorizontalItem,
  AppNavTopbarSortableVerticalItem,
  AppNavTopbarVerticalUtilitySortable,
} from "./app-nav-topbar-utility-sortable.tsx";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./app-nav-topbar-chrome.ts";
import {
  APP_NAV_TOPBAR_UTILITY_CATALOG,
  APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
  APP_NAV_TOPBAR_UTILITY_MAX_PINNED,
  getAppNavTopbarUtilityDefinition,
  isAppNavTopbarUtilityId,
  renderAppNavTopbarUtilityIcon,
  type AppNavTopbarUtilityId,
} from "./app-nav-topbar-utility-actions.catalog.ts";
import {
  DEFAULT_TOPBAR_UTILITIES_SCOPE,
  getTopbarUtilitiesServerSnapshot,
  getTopbarVisibleUtilityIds,
  normalizeTopbarUtilitiesState,
  readTopbarUtilitiesState,
  subscribeTopbarUtilities,
  writeTopbarUtilitiesState,
  type AppNavTopbarUtilitiesState,
  type TopbarUtilitiesScope,
} from "./app-nav-topbar-utility-actions.storage.ts";
import { AppNavTopbarCommandSearch } from "./app-nav-topbar-command-search.tsx";
import { useWorkspaceShortcuts } from "./keyboard-shortcuts/use-keyboard-shortcuts.tsx";

export type AppNavTopbarUtilityActionsProps = {
  onHelpClick?: () => void;
  preview?: boolean;
  tenantId?: string;
  userId?: string;
};

export type AppNavTopbarUtilitiesController = {
  feedbackMenuOpen: boolean;
  handleUtilityAction: (utilityId: AppNavTopbarUtilityId) => void;
  persistUtilitiesState: (state: AppNavTopbarUtilitiesState) => void;
  preview: boolean;
  setFeedbackMenuOpen: (open: boolean) => void;
  tenantId: string;
  userId: string;
  utilitiesState: AppNavTopbarUtilitiesState;
  visibleIds: readonly AppNavTopbarUtilityId[];
};

const AppNavTopbarUtilitiesContext =
  createContext<AppNavTopbarUtilitiesController | null>(null);

export function useAppNavTopbarUtilitiesController(): AppNavTopbarUtilitiesController {
  const context = useContext(AppNavTopbarUtilitiesContext);

  if (!context) {
    throw new Error(
      "useAppNavTopbarUtilitiesController must be used within AppNavTopbarUtilitiesProvider"
    );
  }

  return context;
}

export function AppNavTopbarUtilitiesProvider({
  children,
  onHelpClick,
  preview = false,
  tenantId = DEFAULT_TOPBAR_UTILITIES_SCOPE.tenantId,
  userId = DEFAULT_TOPBAR_UTILITIES_SCOPE.userId,
}: Pick<
  AppNavTopbarUtilityActionsProps,
  "onHelpClick" | "preview" | "tenantId" | "userId"
> & {
  children: ReactNode;
}): ReactElement {
  const controller = useAppNavTopbarUtilitiesControllerValue({
    onHelpClick,
    preview,
    tenantId,
    userId,
  });

  return (
    <AppNavTopbarUtilitiesContext.Provider value={controller}>
      {children}
    </AppNavTopbarUtilitiesContext.Provider>
  );
}

function useAppNavTopbarUtilitiesControllerValue({
  onHelpClick,
  preview = false,
  tenantId = DEFAULT_TOPBAR_UTILITIES_SCOPE.tenantId,
  userId = DEFAULT_TOPBAR_UTILITIES_SCOPE.userId,
}: Pick<
  AppNavTopbarUtilityActionsProps,
  "onHelpClick" | "preview" | "tenantId" | "userId"
>): AppNavTopbarUtilitiesController {
  const router = useRouter();
  const { openCommand, openHelp } = useWorkspaceShortcuts();
  const [feedbackMenuOpen, setFeedbackMenuOpen] = useState(false);
  const scope = useMemo<TopbarUtilitiesScope>(
    () => ({ tenantId, userId }),
    [tenantId, userId]
  );
  const utilitiesStateFromStore = useSyncExternalStore(
    subscribeTopbarUtilities,
    () => readTopbarUtilitiesState(scope),
    getTopbarUtilitiesServerSnapshot
  );
  const [previewUtilitiesState, setPreviewUtilitiesState] =
    useState<AppNavTopbarUtilitiesState>(() => ({
      order: [...APP_NAV_TOPBAR_UTILITY_CATALOG.map((entry) => entry.id)],
      visible: [...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED],
    }));

  const utilitiesState = preview
    ? previewUtilitiesState
    : utilitiesStateFromStore;
  const visibleIds = getTopbarVisibleUtilityIds(utilitiesState);

  const persistUtilitiesState = useCallback(
    (next: AppNavTopbarUtilitiesState): void => {
      const normalized = normalizeTopbarUtilitiesState(next);

      if (preview) {
        setPreviewUtilitiesState(normalized);
        return;
      }

      writeTopbarUtilitiesState(normalized, scope);
    },
    [preview, scope]
  );

  const handleHelpClick = onHelpClick ?? openHelp;

  const handleUtilityAction = useCallback(
    (utilityId: AppNavTopbarUtilityId): void => {
      const definition = getAppNavTopbarUtilityDefinition(utilityId);

      switch (definition.action) {
        case "help":
          handleHelpClick();
          return;
        case "feedback-menu":
          setFeedbackMenuOpen(true);
          return;
        case "keyboard-shortcuts":
          openHelp();
          return;
        case "command-palette":
          openCommand();
          return;
        case "settings-appearance":
          router.push("/settings/appearance");
          return;
        case "notifications-menu":
          return;
        case "stub":
          toast.message(`${definition.label} is not wired yet.`);
      }
    },
    [handleHelpClick, openCommand, openHelp, router]
  );

  return useMemo(
    () => ({
      feedbackMenuOpen,
      handleUtilityAction,
      persistUtilitiesState,
      preview,
      setFeedbackMenuOpen,
      tenantId,
      userId,
      utilitiesState,
      visibleIds,
    }),
    [
      feedbackMenuOpen,
      handleUtilityAction,
      persistUtilitiesState,
      preview,
      tenantId,
      userId,
      utilitiesState,
      visibleIds,
    ]
  );
}

function reorderUtilityIds(
  orderedIds: readonly AppNavTopbarUtilityId[],
  sourceId: AppNavTopbarUtilityId,
  targetId: AppNavTopbarUtilityId
): AppNavTopbarUtilityId[] {
  if (sourceId === targetId) {
    return [...orderedIds];
  }

  const next = [...orderedIds];
  const sourceIndex = next.indexOf(sourceId);
  const targetIndex = next.indexOf(targetId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return next;
  }

  next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, sourceId);

  return next;
}

function reorderVisibleUtilities(
  state: AppNavTopbarUtilitiesState,
  sourceId: AppNavTopbarUtilityId,
  targetId: AppNavTopbarUtilityId
): AppNavTopbarUtilitiesState {
  const visible = getTopbarVisibleUtilityIds(state);

  if (sourceId === targetId) {
    return state;
  }

  const sourceIndex = visible.indexOf(sourceId);
  const targetIndex = visible.indexOf(targetId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return state;
  }

  const reorderedVisible = reorderUtilityIds(visible, sourceId, targetId);
  const visibleSet = new Set(reorderedVisible);

  return {
    order: [
      ...reorderedVisible,
      ...state.order.filter((id) => !visibleSet.has(id)),
    ],
    visible: reorderedVisible,
  };
}

function AppNavTopbarPinnedUtilitiesBar({
  onUtilityAction,
  onUtilitiesStateChange,
  preview,
  tenantId,
  userId,
  visibleIds,
  utilitiesState,
}: {
  onUtilityAction: (utilityId: AppNavTopbarUtilityId) => void;
  onUtilitiesStateChange: (state: AppNavTopbarUtilitiesState) => void;
  preview: boolean;
  tenantId: string;
  userId: string;
  visibleIds: readonly AppNavTopbarUtilityId[];
  utilitiesState: AppNavTopbarUtilitiesState;
}): ReactElement | null {
  const handleReorder = (
    sourceId: AppNavTopbarUtilityId,
    targetId: AppNavTopbarUtilityId
  ): void => {
    const sourceVisible = visibleIds.includes(sourceId);
    const targetVisible = visibleIds.includes(targetId);

    if (sourceVisible && targetVisible) {
      onUtilitiesStateChange(
        reorderVisibleUtilities(utilitiesState, sourceId, targetId)
      );
      return;
    }

    const nextOrder = reorderUtilityIds(
      utilitiesState.order,
      sourceId,
      targetId
    );

    onUtilitiesStateChange({
      order: nextOrder,
      visible: getTopbarVisibleUtilityIds({
        order: nextOrder,
        visible: utilitiesState.visible,
      }),
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      {visibleIds.length > 0 ? (
        <AppNavTopbarHorizontalUtilitySortable
          ids={visibleIds}
          onReorder={handleReorder}
        >
          <div
            aria-label="Pinned utilities"
            className="flex items-center gap-0.5"
            role="group"
          >
            {visibleIds.map((utilityId) => {
          const definition = getAppNavTopbarUtilityDefinition(utilityId);

          if (utilityId === "notifications") {
            return (
              <AppNavTopbarSortableHorizontalItem
                className="cursor-grab active:cursor-grabbing"
                id={utilityId}
                key={utilityId}
              >
                <AppNavTopbarNotifications
                  preview={preview}
                  tenantId={tenantId}
                  userId={userId}
                />
              </AppNavTopbarSortableHorizontalItem>
            );
          }

          return (
            <AppNavTopbarSortableHorizontalItem
              className="cursor-grab active:cursor-grabbing"
              id={utilityId}
              key={utilityId}
            >
              <Button
                className={appNavTopbarGhostIconButtonClassName}
                onClick={() => {
                  onUtilityAction(utilityId);
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                {renderAppNavTopbarUtilityIcon(utilityId)}
                <span className="sr-only">{definition.label}</span>
              </Button>
            </AppNavTopbarSortableHorizontalItem>
          );
            })}
          </div>
        </AppNavTopbarHorizontalUtilitySortable>
      ) : null}
      <AppNavTopbarCommandSearch />
    </div>
  );
}

export function AppNavTopbarUtilitiesWidgetMenu(): ReactElement {
  const {
    handleUtilityAction,
    persistUtilitiesState,
    utilitiesState,
    visibleIds,
  } = useAppNavTopbarUtilitiesController();

  return (
    <AppNavTopbarUtilitiesWidget
      onUtilityAction={handleUtilityAction}
      onUtilitiesStateChange={persistUtilitiesState}
      utilitiesState={utilitiesState}
      visibleIds={visibleIds}
    />
  );
}

function AppNavTopbarUtilitiesWidget({
  onUtilityAction,
  onUtilitiesStateChange,
  utilitiesState,
  visibleIds,
}: {
  onUtilityAction: (utilityId: AppNavTopbarUtilityId) => void;
  onUtilitiesStateChange: (state: AppNavTopbarUtilitiesState) => void;
  utilitiesState: AppNavTopbarUtilitiesState;
  visibleIds: readonly AppNavTopbarUtilityId[];
}): ReactElement {
  const [open, setOpen] = useState(false);

  const visibleSet = useMemo(
    () => new Set(utilitiesState.visible),
    [utilitiesState.visible]
  );

  const toggleUtility = (utilityId: AppNavTopbarUtilityId): void => {
    const isVisible = visibleSet.has(utilityId);

    if (isVisible) {
      onUtilitiesStateChange({
        ...utilitiesState,
        visible: utilitiesState.visible.filter((id) => id !== utilityId),
      });
      return;
    }

    if (visibleIds.length >= APP_NAV_TOPBAR_UTILITY_MAX_PINNED) {
      toast.message(
        `Maximum ${APP_NAV_TOPBAR_UTILITY_MAX_PINNED} utility icons can appear on the bar.`
      );
      return;
    }

    onUtilitiesStateChange({
      ...utilitiesState,
      visible: [...utilitiesState.visible, utilityId],
    });
  };

  const handleWidgetReorder = (
    sourceId: AppNavTopbarUtilityId,
    targetId: AppNavTopbarUtilityId
  ): void => {
    const nextOrder = reorderUtilityIds(
      utilitiesState.order,
      sourceId,
      targetId
    );

    onUtilitiesStateChange({
      order: nextOrder,
      visible: getTopbarVisibleUtilityIds({
        order: nextOrder,
        visible: utilitiesState.visible,
      }),
    });
  };

  return (
    <Popover modal={false} onOpenChange={setOpen} open={open}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              aria-haspopup="dialog"
              className={cn(
                appNavTopbarGhostIconButtonClassName,
                "data-[state=open]:bg-accent"
              )}
              size="icon"
              type="button"
              variant="ghost"
            >
              <LayoutDashboard className={appNavTopbarIconClassName} />
              <span className="sr-only">Utilities</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Utilities</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-72 p-0" sideOffset={4}>
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle className="text-sm">Utilities widget</PopoverTitle>
          <PopoverDescription>
            Choose which icons appear on the topbar. Drag here or on the topbar
            to reorder.
          </PopoverDescription>
        </PopoverHeader>
        <div className="px-2 py-2">
          <p className="px-2 pb-2 text-muted-foreground text-xs">
            {visibleIds.length}/{APP_NAV_TOPBAR_UTILITY_MAX_PINNED} selected ·{" "}
            {APP_NAV_TOPBAR_UTILITY_CATALOG.length} available
          </p>
          <AppNavTopbarVerticalUtilitySortable
            ids={utilitiesState.order}
            onReorder={handleWidgetReorder}
          >
            <ul className="flex flex-col gap-1">
              {utilitiesState.order.map((utilityId) => {
                const utility = getAppNavTopbarUtilityDefinition(utilityId);
                const checked = visibleSet.has(utilityId);
                const disabled =
                  !checked &&
                  visibleIds.length >= APP_NAV_TOPBAR_UTILITY_MAX_PINNED;

                return (
                  <AppNavTopbarSortableVerticalItem
                    className={cn(
                      "cursor-grab active:cursor-grabbing",
                      disabled && "opacity-50"
                    )}
                    id={utilityId}
                    key={utilityId}
                  >
                    <div className="flex items-center gap-2 rounded-md px-1 py-1">
                      <span
                        aria-hidden
                        className="flex size-7 shrink-0 items-center justify-center text-muted-foreground"
                      >
                        <GripVertical className="size-3.5" />
                      </span>
                      <Checkbox
                        aria-label={`Show ${utility.label} on topbar`}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => {
                          toggleUtility(utilityId);
                        }}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                      />
                      <button
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left hover:bg-accent"
                        onClick={() => {
                          onUtilityAction(utilityId);
                        }}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        type="button"
                      >
                        <span className="text-muted-foreground">
                          {renderAppNavTopbarUtilityIcon(utilityId)}
                        </span>
                        <span className="truncate text-sm">
                          {utility.label}
                        </span>
                      </button>
                    </div>
                  </AppNavTopbarSortableVerticalItem>
                );
              })}
            </ul>
          </AppNavTopbarVerticalUtilitySortable>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AppNavTopbarFeedbackMenu({
  onOpenChange,
  open,
  showTrigger = true,
}: {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  showTrigger?: boolean;
} = {}): ReactElement {
  const [internalOpen, setInternalOpen] = useState(false);
  const resolvedOpen = open ?? internalOpen;
  const resolvedOnOpenChange = onOpenChange ?? setInternalOpen;

  return (
    <Popover onOpenChange={resolvedOnOpenChange} open={resolvedOpen}>
      {showTrigger ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                aria-haspopup="dialog"
                className={cn(
                  appNavTopbarGhostIconButtonClassName,
                  "data-[state=open]:bg-accent"
                )}
                size="icon"
                type="button"
                variant="ghost"
              >
                <MessageSquareWarning className={appNavTopbarIconClassName} />
                <span className="sr-only">Feedback</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Feedback</TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild>
          <button
            aria-hidden
            className="pointer-events-none fixed bottom-0 right-0 size-0 opacity-0"
            tabIndex={-1}
            type="button"
          />
        </PopoverTrigger>
      )}
      <PopoverContent align="end" className="w-52 p-1" sideOffset={4}>
        <Button
          className="w-full justify-start gap-2"
          onClick={() => {
            resolvedOnOpenChange(false);
            toast.message("Issue feedback is not wired yet.");
          }}
          type="button"
          variant="ghost"
        >
          <Bug className={appNavTopbarIconClassName} />
          Issue
        </Button>
        <Button
          className="w-full justify-start gap-2"
          onClick={() => {
            resolvedOnOpenChange(false);
            toast.message("Ideas feedback is not wired yet.");
          }}
          type="button"
          variant="ghost"
        >
          <Zap className={appNavTopbarIconClassName} />
          Ideas
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function AppNavTopbarUtilityActions(): ReactElement {
  const {
    feedbackMenuOpen,
    handleUtilityAction,
    persistUtilitiesState,
    preview,
    setFeedbackMenuOpen,
    tenantId,
    userId,
    utilitiesState,
    visibleIds,
  } = useAppNavTopbarUtilitiesController();

  return (
    <>
      <AppNavTopbarPinnedUtilitiesBar
        onUtilitiesStateChange={persistUtilitiesState}
        onUtilityAction={handleUtilityAction}
        preview={preview}
        tenantId={tenantId}
        userId={userId}
        utilitiesState={utilitiesState}
        visibleIds={visibleIds}
      />
      <AppNavTopbarFeedbackMenu
        onOpenChange={setFeedbackMenuOpen}
        open={feedbackMenuOpen}
        showTrigger={false}
      />
    </>
  );
}
