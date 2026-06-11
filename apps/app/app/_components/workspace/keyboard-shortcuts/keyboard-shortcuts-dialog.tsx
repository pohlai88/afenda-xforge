"use client";

import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Kbd,
  KbdGroup,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@repo/ui";
import { Keyboard, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import type {
  ResolvedShortcut,
  ShortcutActionId,
  ShortcutGroup,
  ShortcutOverridePatch,
  WorkspaceShortcutsPayload,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import { formatShortcutLabel } from "../../../../lib/workspace-shortcuts/format-shortcut.ts";
import {
  persistShortcutOverrides,
  validatePendingUserOverrides,
} from "../../../../lib/workspace-shortcuts/persist-shortcuts.client.ts";
import {
  previewUserShortcutPatch,
  resolveEffectiveUserBinding,
} from "../../../../lib/workspace-shortcuts/preview-shortcuts.ts";
import { PRODUCT_SHORTCUT_DEFINITIONS } from "../../../../lib/workspace-shortcuts/product-defaults.ts";
import { ShortcutCapturePopover } from "./shortcut-capture-popover.tsx";
import { shortcutActionMessageKey } from "./shortcut-i18n.ts";
import {
  ShortcutBadgeGroup,
  ShortcutFnKeyBadge,
  ShortcutReliabilityBadge,
  ShortcutSourceBadge,
} from "./shortcut-source-badge.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";

const GROUP_ORDER: readonly ShortcutGroup[] = ["navigation", "crud", "help"];

function ShortcutKeyDisplay({
  shortcut,
}: {
  shortcut: ResolvedShortcut;
}): ReactElement {
  const labels = [shortcut.binding.label];

  if (shortcut.secondaryBinding) {
    labels.push(shortcut.secondaryBinding.label);
  }

  return (
    <div>
      <KbdGroup>
        {labels.map((label) => (
          <Kbd key={label}>{label}</Kbd>
        ))}
      </KbdGroup>
    </div>
  );
}

function ShortcutRow({
  canCustomize,
  effectiveNormalized,
  onReset,
  onCapture,
  payload,
  pendingOverrides,
  row,
}: {
  canCustomize: boolean;
  effectiveNormalized: string;
  onCapture: (normalized: string) => void;
  onReset: () => void;
  payload: WorkspaceShortcutsPayload;
  pendingOverrides: ShortcutOverridePatch;
  row: ResolvedShortcut;
}): ReactElement {
  const tActions = useTranslations("workspace.keyboardShortcuts.actions");
  const tBadges = useTranslations("workspace.keyboardShortcuts.badges");
  const tCommon = useTranslations("common");
  const actionLabel = tActions(shortcutActionMessageKey(row.actionId));
  const pendingValue = pendingOverrides[row.actionId];
  const displayShortcut =
    pendingValue === undefined
      ? row
      : {
          ...row,
          binding: {
            ...row.binding,
            normalized: effectiveNormalized,
            label: formatShortcutLabel(effectiveNormalized),
          },
        };
  const hasPendingChange = pendingValue !== undefined;

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-sm">{actionLabel}</p>
          {hasPendingChange ? (
            <Badge variant="secondary">{tBadges("pending")}</Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShortcutBadgeGroup>
            <ShortcutSourceBadge shortcut={row} />
            <ShortcutFnKeyBadge normalized={effectiveNormalized} />
            <ShortcutReliabilityBadge shortcut={row} />
          </ShortcutBadgeGroup>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canCustomize && !row.locked ? (
          <>
            <ShortcutKeyDisplay shortcut={displayShortcut} />
            <ShortcutCapturePopover
              actionId={row.actionId}
              actionLabel={actionLabel}
              allowFnKeyBindings={payload.policy.allowFnKeyBindings}
              collisionContext={{
                payload,
                pendingOverrides,
              }}
              onCapture={onCapture}
              pendingOverrides={pendingOverrides}
              value={effectiveNormalized}
            />
            {row.source === "user" || hasPendingChange ? (
              <Button onClick={onReset} size="sm" type="button" variant="ghost">
                {tCommon("reset")}
              </Button>
            ) : null}
          </>
        ) : (
          <ShortcutKeyDisplay shortcut={displayShortcut} />
        )}
      </div>
    </div>
  );
}

export function KeyboardShortcutsDialog({
  onOpenChange,
  open,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  const t = useTranslations("workspace.keyboardShortcuts");
  const tActions = useTranslations("workspace.keyboardShortcuts.actions");
  const tCommon = useTranslations("common");
  const { payload, setPayload } = useWorkspaceShortcuts();
  const [pendingOverrides, setPendingOverrides] =
    useState<ShortcutOverridePatch>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ShortcutGroup>("navigation");
  const [searchQuery, setSearchQuery] = useState("");
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const rowsByGroup = useMemo(
    () =>
      GROUP_ORDER.reduce<Record<ShortcutGroup, ResolvedShortcut[]>>(
        (groups, group) => {
          groups[group] = PRODUCT_SHORTCUT_DEFINITIONS.filter(
            (definition) => definition.group === group
          )
            .map((definition) => payload.bindings[definition.actionId])
            .filter((row) => {
              if (!normalizedQuery) {
                return true;
              }

              const actionLabel = tActions(
                shortcutActionMessageKey(row.actionId)
              );

              return (
                actionLabel.toLowerCase().includes(normalizedQuery) ||
                row.description.toLowerCase().includes(normalizedQuery) ||
                row.binding.label.toLowerCase().includes(normalizedQuery) ||
                row.secondaryBinding?.label
                  .toLowerCase()
                  .includes(normalizedQuery) === true
              );
            });
          return groups;
        },
        { navigation: [], crud: [], help: [] }
      ),
    [normalizedQuery, payload.bindings, tActions]
  );

  const canCustomize = payload.policy.allowUserCustomize;
  const pendingCount = Object.keys(pendingOverrides).length;

  const collisionPayload = useMemo(
    () =>
      pendingCount > 0
        ? previewUserShortcutPatch(payload, pendingOverrides)
        : payload,
    [payload, pendingCount, pendingOverrides]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && pendingCount > 0) {
        setDiscardConfirmOpen(true);
        return;
      }

      if (!nextOpen) {
        setPendingOverrides({});
        setSearchQuery("");
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange, pendingCount]
  );

  const confirmDiscardAndClose = (): void => {
    setPendingOverrides({});
    setSearchQuery("");
    setDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const handleSave = async (): Promise<void> => {
    if (pendingCount === 0) {
      return;
    }

    const validation = validatePendingUserOverrides(pendingOverrides, payload);

    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    setSaving(true);

    try {
      const result = await persistShortcutOverrides(pendingOverrides);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setPayload(result.payload);
      setPendingOverrides({});
      toast.message(t("saveSuccess"));
    } finally {
      setSaving(false);
    }
  };

  const resetAction = (actionId: ShortcutActionId): void => {
    setPendingOverrides((current) => ({
      ...current,
      [actionId]: null,
    }));
  };

  const resolveEffectiveNormalized = (row: ResolvedShortcut): string =>
    resolveEffectiveUserBinding(payload, row.actionId, pendingOverrides);

  return (
    <>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="space-y-3 px-6 pt-6">
            <div className="flex items-center gap-2">
              <Keyboard className="size-5 text-muted-foreground" />
              <DialogTitle>{t("title")}</DialogTitle>
            </div>
            <DialogDescription>{t("description")}</DialogDescription>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={t("searchPlaceholder")}
                className="pl-9"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
              />
            </div>
          </DialogHeader>

          {canCustomize ? null : (
            <div className="px-6">
              <Alert>
                <AlertDescription>{t("policyDisabled")}</AlertDescription>
              </Alert>
            </div>
          )}

          <Separator className="my-4" />

          <Tabs
            className="flex min-h-0 flex-1 flex-col px-6"
            onValueChange={(value) => setActiveTab(value as ShortcutGroup)}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              {GROUP_ORDER.map((group) => (
                <TabsTrigger key={group} value={group}>
                  {t(`groups.${group}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="mt-4 max-h-[46vh] pr-3">
              {GROUP_ORDER.map((group) => (
                <TabsContent
                  className="mt-0 space-y-3"
                  key={group}
                  value={group}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {t(`groups.${group}`)}
                      </CardTitle>
                      <CardDescription>
                        {group === "crud"
                          ? t("groups.crudDescription")
                          : t("groups.globalDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                      {rowsByGroup[group].length === 0 ? (
                        <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                          {t("noSearchResults")}
                        </p>
                      ) : (
                        rowsByGroup[group].map((row) => (
                          <ShortcutRow
                            canCustomize={canCustomize}
                            effectiveNormalized={resolveEffectiveNormalized(
                              row
                            )}
                            key={row.actionId}
                            onCapture={(normalized) =>
                              setPendingOverrides((current) => ({
                                ...current,
                                [row.actionId]: normalized,
                              }))
                            }
                            onReset={() => resetAction(row.actionId)}
                            payload={collisionPayload}
                            pendingOverrides={pendingOverrides}
                            row={row}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>

          {canCustomize ? (
            <DialogFooter className="gap-2 border-t px-6 py-4 sm:justify-between">
              <p className="text-muted-foreground text-xs">
                {pendingCount > 0
                  ? t("unsavedChanges", { count: pendingCount })
                  : t("noPendingChanges")}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={pendingCount === 0}
                  onClick={() => setPendingOverrides({})}
                  type="button"
                  variant="outline"
                >
                  {tCommon("discard")}
                </Button>
                <Button
                  disabled={saving || pendingCount === 0}
                  onClick={() => {
                    handleSave().catch(() => undefined);
                  }}
                  type="button"
                >
                  {t("savePersonal")}
                </Button>
              </div>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setDiscardConfirmOpen}
        open={discardConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("discardConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("discardConfirm.description", { count: pendingCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("discardConfirm.keepEditing")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardAndClose}>
              {t("discardConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
