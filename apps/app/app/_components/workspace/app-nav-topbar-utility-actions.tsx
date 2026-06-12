"use client";

import {
  Button,
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  ScrollArea,
  Textarea,
  toast,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import {
  Bug,
  GripVertical,
  LayersPlus,
  LayoutDashboard,
  MessageSquareWarning,
  Send,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
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
import { AppNavTopbarIconTooltip } from "./app-nav-topbar-tooltip.tsx";
import { APP_NAV_TOPBAR_UTILITIES_WIDGET_TOOLTIP } from "./app-nav-topbar-tooltips.ts";
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
import { useWorkspaceShortcuts } from "./keyboard-shortcuts/use-keyboard-shortcuts.tsx";

const utilitiesWidgetPopoverClassName =
  "w-72 overflow-hidden rounded-lg p-0";

const utilitiesWidgetListScrollClassName =
  "h-[min(12rem,calc(70vh-16rem))]";

const utilitiesWidgetListRegionClassName = "px-2 pb-2 pr-3";

const utilitiesWidgetFooterClassName =
  "border-t border-border bg-muted/20 px-4 py-3";

const utilitiesWidgetRowActionClassName =
  "h-auto min-w-0 flex-1 justify-start gap-3 px-2 py-1 font-normal";

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

  if (visibleIds.length === 0) {
    return null;
  }

  return (
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
              <AppNavTopbarIconTooltip
                description={definition.description}
                title={definition.label}
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
              </AppNavTopbarIconTooltip>
            </AppNavTopbarSortableHorizontalItem>
          );
        })}
      </div>
    </AppNavTopbarHorizontalUtilitySortable>
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
  const [utilityRequest, setUtilityRequest] = useState("");
  const utilityRequestFieldId = useId();

  const visibleSet = useMemo(
    () => new Set(utilitiesState.visible),
    [utilitiesState.visible]
  );

  const submitUtilityRequest = (): void => {
    const message = utilityRequest.trim();

    if (!message) {
      return;
    }

    toast.message("Utility request received. Product will review your suggestion.");
    setUtilityRequest("");
  };

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
      <AppNavTopbarIconTooltip
        description={APP_NAV_TOPBAR_UTILITIES_WIDGET_TOOLTIP.description}
        title={APP_NAV_TOPBAR_UTILITIES_WIDGET_TOOLTIP.title}
      >
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
            <span className="sr-only">
              {APP_NAV_TOPBAR_UTILITIES_WIDGET_TOOLTIP.title}
            </span>
          </Button>
        </PopoverTrigger>
      </AppNavTopbarIconTooltip>
      <PopoverContent
        align="end"
        className={utilitiesWidgetPopoverClassName}
        sideOffset={4}
      >
        <PopoverHeader className="border-b border-border px-4 py-3">
          <PopoverTitle className="text-sm">Utilities widget</PopoverTitle>
          <PopoverDescription className="text-xs">
            Choose which icons appear on the topbar. Drag here or on the topbar
            to reorder.
          </PopoverDescription>
        </PopoverHeader>
        <p className="px-4 pt-3 pb-1 text-muted-foreground text-xs">
          {visibleIds.length}/{APP_NAV_TOPBAR_UTILITY_MAX_PINNED} selected ·{" "}
          {APP_NAV_TOPBAR_UTILITY_CATALOG.length} available
        </p>
        <ScrollArea className={utilitiesWidgetListScrollClassName}>
          <div className={utilitiesWidgetListRegionClassName}>
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
                        <Button
                          className={utilitiesWidgetRowActionClassName}
                          onClick={() => {
                            onUtilityAction(utilityId);
                          }}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                          }}
                          type="button"
                          variant="ghost"
                        >
                          <span className="text-muted-foreground">
                            {renderAppNavTopbarUtilityIcon(utilityId)}
                          </span>
                          <span className="truncate text-sm">
                            {utility.label}
                          </span>
                        </Button>
                      </div>
                    </AppNavTopbarSortableVerticalItem>
                  );
                })}
              </ul>
            </AppNavTopbarVerticalUtilitySortable>
          </div>
        </ScrollArea>
        <footer className={utilitiesWidgetFooterClassName}>
          <div className="mb-2 flex items-center gap-2">
            <LayersPlus
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <Label
              className="font-medium text-sm"
              htmlFor={utilityRequestFieldId}
            >
              Request a utility
            </Label>
          </div>
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitUtilityRequest();
            }}
          >
            <Textarea
              className="max-h-24 min-h-16 resize-none text-sm"
              id={utilityRequestFieldId}
              onChange={(event) => {
                setUtilityRequest(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  submitUtilityRequest();
                }
              }}
              placeholder="Describe the shortcut or tool you need…"
              rows={2}
              value={utilityRequest}
            />
            <div className="flex justify-end">
              <Button
                className="gap-1.5"
                disabled={!utilityRequest.trim()}
                size="sm"
                type="submit"
              >
                <Send className="size-3.5" />
                Send
              </Button>
            </div>
          </form>
        </footer>
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
        <AppNavTopbarIconTooltip
          description={
            getAppNavTopbarUtilityDefinition("feedback").description
          }
          title={getAppNavTopbarUtilityDefinition("feedback").label}
        >
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
              <span className="sr-only">
                {getAppNavTopbarUtilityDefinition("feedback").label}
              </span>
            </Button>
          </PopoverTrigger>
        </AppNavTopbarIconTooltip>
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
