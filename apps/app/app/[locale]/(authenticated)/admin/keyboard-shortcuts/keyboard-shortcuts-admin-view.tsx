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
  Checkbox,
  Label,
  ScrollArea,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@repo/ui";
import { Keyboard, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  TenantKeyboardShortcutPolicyPayload,
} from "../../../../../lib/workspace-shortcuts/contract.ts";
import { WORKSPACE_KEYBOARD_SHORTCUTS_BROADCAST_CHANNEL } from "../../../../../lib/workspace-shortcuts/contract.ts";
import { formatShortcutLabel } from "../../../../../lib/workspace-shortcuts/format-shortcut.ts";
import {
  persistTenantKeyboardShortcutPolicy,
  validatePendingTenantPolicy,
} from "../../../../../lib/workspace-shortcuts/persist-tenant-shortcuts.client.ts";
import { previewTenantPolicyDraft } from "../../../../../lib/workspace-shortcuts/preview-shortcuts.ts";
import {
  PRODUCT_LOCKED_ACTIONS,
  PRODUCT_SHORTCUT_DEFINITIONS,
} from "../../../../../lib/workspace-shortcuts/product-defaults.ts";
import { ShortcutCapturePopover } from "../../../../_components/workspace/keyboard-shortcuts/shortcut-capture-popover.tsx";
import { shortcutActionMessageKey } from "../../../../_components/workspace/keyboard-shortcuts/shortcut-i18n.ts";

type SaveStatus = "idle" | "pending" | "success" | "error";

const CUSTOMIZABLE_ACTIONS = PRODUCT_SHORTCUT_DEFINITIONS.filter(
  (definition) => !definition.locked
);

export function KeyboardShortcutsAdminView({
  canWrite,
  initialPayload,
}: {
  canWrite: boolean;
  initialPayload: TenantKeyboardShortcutPolicyPayload;
}): ReactElement {
  const t = useTranslations("admin.keyboardShortcuts");
  const tActions = useTranslations("workspace.keyboardShortcuts.actions");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [payload, setPayload] = useState(initialPayload);
  const [allowUserCustomize, setAllowUserCustomize] = useState(
    initialPayload.policy.allowUserCustomize
  );
  const [allowFnKeyBindings, setAllowFnKeyBindings] = useState(
    initialPayload.policy.allowFnKeyBindings
  );
  const [lockedActions, setLockedActions] = useState<ShortcutActionId[]>(
    initialPayload.policy.lockedActions
  );
  const [pendingOverrides, setPendingOverrides] =
    useState<ShortcutOverridePatch>({});
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [activeTab, setActiveTab] = useState("policy");

  const dirty = useMemo(() => {
    const policyDirty =
      allowUserCustomize !== payload.policy.allowUserCustomize ||
      allowFnKeyBindings !== payload.policy.allowFnKeyBindings ||
      lockedActions.join(",") !== payload.policy.lockedActions.join(",");

    return policyDirty || Object.keys(pendingOverrides).length > 0;
  }, [
    allowFnKeyBindings,
    allowUserCustomize,
    lockedActions,
    payload.policy,
    pendingOverrides,
  ]);

  const draftPreview = useMemo(
    () =>
      previewTenantPolicyDraft(payload, {
        allowUserCustomize,
        allowFnKeyBindings,
        lockedActions,
        pendingOverrides,
      }),
    [
      allowFnKeyBindings,
      allowUserCustomize,
      lockedActions,
      payload,
      pendingOverrides,
    ]
  );

  const toggleLockedAction = (
    actionId: ShortcutActionId,
    checked: boolean
  ): void => {
    setLockedActions((current) => {
      if (checked) {
        return current.includes(actionId) ? current : [...current, actionId];
      }

      return current.filter((entry) => entry !== actionId);
    });
  };

  const discardDraft = (): void => {
    setAllowUserCustomize(payload.policy.allowUserCustomize);
    setAllowFnKeyBindings(payload.policy.allowFnKeyBindings);
    setLockedActions(payload.policy.lockedActions);
    setPendingOverrides({});
    setStatus("idle");
  };

  const savePolicy = async (): Promise<void> => {
    if (!(canWrite && dirty)) {
      return;
    }

    const validation = validatePendingTenantPolicy({
      allowUserCustomize,
      allowFnKeyBindings,
      lockedActions,
      pendingOverrides,
      savedPolicy: payload.policy,
    });

    if (!validation.ok) {
      setStatus("error");
      toast.error(validation.error);
      return;
    }

    setStatus("pending");

    const patch: Record<string, unknown> = {
      allowUserCustomize,
      allowFnKeyBindings,
      lockedActions,
    };

    if (Object.keys(pendingOverrides).length > 0) {
      patch.overrides = pendingOverrides;
    }

    try {
      const result = await persistTenantKeyboardShortcutPolicy(patch);

      if (!result.ok) {
        setStatus("error");
        toast.error(result.error);
        return;
      }

      setPayload(result.payload);
      setAllowUserCustomize(result.payload.policy.allowUserCustomize);
      setAllowFnKeyBindings(result.payload.policy.allowFnKeyBindings);
      setLockedActions(result.payload.policy.lockedActions);
      setPendingOverrides({});
      setStatus("success");
      toast.message(t("saveSuccess"));
      router.refresh();

      if (typeof BroadcastChannel !== "undefined") {
        new BroadcastChannel(
          WORKSPACE_KEYBOARD_SHORTCUTS_BROADCAST_CHANNEL
        ).postMessage({
          type: "tenant-policy-updated",
        });
      }
    } catch (error) {
      setStatus("error");
      toast.error(error instanceof Error ? error.message : t("saveFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Keyboard className="size-6 text-muted-foreground" />
          <h1 className="font-semibold text-2xl tracking-tight">
            {t("title")}
          </h1>
          <Badge variant="outline">{t("badge")}</Badge>
        </div>
        <p className="max-w-3xl text-muted-foreground text-sm">
          {t("description")}
        </p>
      </header>

      {canWrite ? null : (
        <Alert>
          <ShieldCheck className="size-4" />
          <AlertDescription>{t("readOnly")}</AlertDescription>
        </Alert>
      )}

      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="policy">{t("tabs.policy")}</TabsTrigger>
          <TabsTrigger value="locked">{t("tabs.locked")}</TabsTrigger>
          <TabsTrigger value="overrides">{t("tabs.overrides")}</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="policy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("customizationPolicy.title")}
              </CardTitle>
              <CardDescription>
                {t("customizationPolicy.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="allow-user-customize">
                    {t("customizationPolicy.allowUserCustomizeLabel")}
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {t("customizationPolicy.allowUserCustomizeDescription")}
                  </p>
                </div>
                <Switch
                  checked={allowUserCustomize}
                  disabled={!canWrite}
                  id="allow-user-customize"
                  onCheckedChange={setAllowUserCustomize}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="allow-fn-keys">
                    {t("customizationPolicy.allowFnKeysLabel")}
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {t("customizationPolicy.allowFnKeysDescription")}
                  </p>
                </div>
                <Switch
                  checked={allowFnKeyBindings}
                  disabled={!canWrite}
                  id="allow-fn-keys"
                  onCheckedChange={setAllowFnKeyBindings}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="locked">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("lockedActions.title")}
              </CardTitle>
              <CardDescription>
                {t("lockedActions.description", {
                  lockedActions: PRODUCT_LOCKED_ACTIONS.join(", "),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {CUSTOMIZABLE_ACTIONS.map((definition) => {
                const checked = lockedActions.includes(definition.actionId);
                const checkboxId = `lock-${definition.actionId}`;

                return (
                  <div
                    className="flex items-start gap-3 rounded-md border px-3 py-3"
                    key={definition.actionId}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={!canWrite}
                      id={checkboxId}
                      onCheckedChange={(next) =>
                        toggleLockedAction(definition.actionId, next === true)
                      }
                    />
                    <Label
                      className="space-y-1 font-normal"
                      htmlFor={checkboxId}
                    >
                      <span className="block font-medium text-sm">
                        {tActions(
                          shortcutActionMessageKey(definition.actionId)
                        )}
                      </span>
                      <span className="block text-muted-foreground text-xs">
                        {definition.actionId}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="overrides">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("organizationOverrides.title")}
              </CardTitle>
              <CardDescription>
                {t("organizationOverrides.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[min(56vh,640px)]">
                <div className="divide-y">
                  {CUSTOMIZABLE_ACTIONS.map((definition) => {
                    const savedResolved =
                      payload.preview.bindings[definition.actionId];
                    const resolved = draftPreview.bindings[definition.actionId];
                    const pendingValue = pendingOverrides[definition.actionId];
                    const effectiveNormalized = resolved.binding.normalized;
                    const isLocked = lockedActions.includes(
                      definition.actionId
                    );

                    return (
                      <div
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        key={definition.actionId}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {tActions(
                              shortcutActionMessageKey(definition.actionId)
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatShortcutLabel(effectiveNormalized)}
                            {pendingValue === undefined
                              ? null
                              : ` · ${t("organizationOverrides.pendingHint")}`}
                            {isLocked
                              ? ` · ${t("organizationOverrides.lockedHint")}`
                              : null}
                          </p>
                        </div>
                        {canWrite ? (
                          <div className="flex items-center gap-2">
                            <ShortcutCapturePopover
                              actionId={definition.actionId}
                              actionLabel={tActions(
                                shortcutActionMessageKey(definition.actionId)
                              )}
                              allowFnKeyBindings={allowFnKeyBindings}
                              collisionContext={{
                                payload: draftPreview,
                                pendingOverrides,
                              }}
                              disabled={isLocked}
                              onCapture={(normalized) =>
                                setPendingOverrides((current) => ({
                                  ...current,
                                  [definition.actionId]: normalized,
                                }))
                              }
                              pendingOverrides={pendingOverrides}
                              value={effectiveNormalized}
                            />
                            {savedResolved.source === "tenant" ||
                            pendingValue !== undefined ? (
                              <Button
                                disabled={isLocked}
                                onClick={() =>
                                  setPendingOverrides((current) => ({
                                    ...current,
                                    [definition.actionId]: null,
                                  }))
                                }
                                size="sm"
                                type="button"
                                variant="ghost"
                              >
                                {tCommon("reset")}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canWrite ? (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <p className="text-muted-foreground text-xs">
            {dirty ? t("statusDirty") : t("statusSaved")}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={!dirty || status === "pending"}
              onClick={discardDraft}
              type="button"
              variant="outline"
            >
              {tCommon("discard")}
            </Button>
            <Button
              disabled={!dirty || status === "pending"}
              onClick={() => {
                savePolicy().catch(() => undefined);
              }}
              type="button"
            >
              {status === "pending" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("savePolicy")
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
