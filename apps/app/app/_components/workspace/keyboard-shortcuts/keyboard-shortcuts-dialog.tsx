"use client";

import {
  Alert,
  AlertDescription,
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
import { Keyboard } from "lucide-react";
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
import {
  ShortcutFnKeyBadge,
  ShortcutReliabilityBadge,
  ShortcutSourceBadge,
} from "./shortcut-source-badge.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";

const GROUP_LABELS: Record<ShortcutGroup, string> = {
  navigation: "Navigation",
  crud: "CRUD",
  help: "Help",
};

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
    <KbdGroup>
      {labels.map((label) => (
        <Kbd key={label}>{label}</Kbd>
      ))}
    </KbdGroup>
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
          <p className="font-medium text-sm">{row.description}</p>
          {hasPendingChange ? <Badge variant="secondary">Pending</Badge> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShortcutSourceBadge shortcut={row} />
          <ShortcutFnKeyBadge normalized={effectiveNormalized} />
          <ShortcutReliabilityBadge shortcut={row} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canCustomize && !row.locked ? (
          <>
            <ShortcutCapturePopover
              actionId={row.actionId}
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
                Reset
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
  const { payload, setPayload } = useWorkspaceShortcuts();
  const [pendingOverrides, setPendingOverrides] =
    useState<ShortcutOverridePatch>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ShortcutGroup>("navigation");

  const rowsByGroup = useMemo(
    () =>
      GROUP_ORDER.reduce<Record<ShortcutGroup, ResolvedShortcut[]>>(
        (groups, group) => {
          groups[group] = PRODUCT_SHORTCUT_DEFINITIONS.filter(
            (definition) => definition.group === group
          ).map((definition) => payload.bindings[definition.actionId]);
          return groups;
        },
        { navigation: [], crud: [], help: [] }
      ),
    [payload.bindings]
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
      if (!nextOpen) {
        setPendingOverrides({});
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

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
      toast.message("Keyboard shortcuts saved");
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
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-3 px-6 pt-6">
          <div className="flex items-center gap-2">
            <Keyboard className="size-5 text-muted-foreground" />
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Server-resolved workspace command bindings. Turn Fn lock off to use
            function keys like Excel.
          </DialogDescription>
        </DialogHeader>

        {canCustomize ? null : (
          <div className="px-6">
            <Alert>
              <AlertDescription>
                Personal customization is disabled by your organization.
                Bindings shown here are read-only.
              </AlertDescription>
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
                {GROUP_LABELS[group]}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="mt-4 max-h-[46vh] pr-3">
            {GROUP_ORDER.map((group) => (
              <TabsContent className="mt-0 space-y-3" key={group} value={group}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {GROUP_LABELS[group]}
                    </CardTitle>
                    <CardDescription>
                      {group === "crud"
                        ? "CRUD keys dispatch to the focused record or form."
                        : "Global workspace commands."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y p-0">
                    {rowsByGroup[group].map((row) => (
                      <ShortcutRow
                        canCustomize={canCustomize}
                        effectiveNormalized={resolveEffectiveNormalized(row)}
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
                    ))}
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
                ? `${pendingCount} unsaved change${pendingCount === 1 ? "" : "s"}`
                : "No pending changes"}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={pendingCount === 0}
                onClick={() => setPendingOverrides({})}
                type="button"
                variant="outline"
              >
                Discard
              </Button>
              <Button
                disabled={saving || pendingCount === 0}
                onClick={() => {
                  handleSave().catch(() => undefined);
                }}
                type="button"
              >
                Save personal shortcuts
              </Button>
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
