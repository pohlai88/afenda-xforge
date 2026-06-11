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
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@repo/ui";
import { Keyboard, ShieldCheck } from "lucide-react";
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
      toast.message("Tenant keyboard shortcut policy saved");
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
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Keyboard className="size-6 text-muted-foreground" />
          <h1 className="font-semibold text-2xl tracking-tight">
            Keyboard shortcuts
          </h1>
          <Badge variant="outline">Tenant policy</Badge>
        </div>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Organization defaults ship for every user. Lock actions to prevent
          personal overrides, or allow users to customize when policy permits.
        </p>
      </header>

      {canWrite ? null : (
        <Alert>
          <ShieldCheck className="size-4" />
          <AlertDescription>
            You have read-only access to tenant keyboard shortcut policy.
          </AlertDescription>
        </Alert>
      )}

      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="locked">Locked actions</TabsTrigger>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="policy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customization policy</CardTitle>
              <CardDescription>
                Controls whether users can personalize bindings and use function
                keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="allow-user-customize">
                    Allow user customization
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    When enabled, users can override unlocked bindings for
                    themselves.
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
                    Allow function key bindings
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Disable when laptops should keep media keys instead of
                    F-keys.
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
              <CardTitle className="text-base">Locked actions</CardTitle>
              <CardDescription>
                Product-locked commands ({PRODUCT_LOCKED_ACTIONS.join(", ")})
                cannot be changed here.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {CUSTOMIZABLE_ACTIONS.map((definition) => {
                const checked = lockedActions.includes(definition.actionId);

                return (
                  <div
                    className="flex items-start gap-3 rounded-md border px-3 py-3"
                    key={definition.actionId}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={!canWrite}
                      onCheckedChange={(next) =>
                        toggleLockedAction(definition.actionId, next === true)
                      }
                    />
                    <span className="space-y-1">
                      <span className="block font-medium text-sm">
                        {definition.description}
                      </span>
                      <span className="block text-muted-foreground text-xs">
                        {definition.actionId}
                      </span>
                    </span>
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
                Organization overrides
              </CardTitle>
              <CardDescription>
                Tenant defaults override product bindings for all users in this
                organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {CUSTOMIZABLE_ACTIONS.map((definition) => {
                const savedResolved =
                  payload.preview.bindings[definition.actionId];
                const resolved = draftPreview.bindings[definition.actionId];
                const pendingValue = pendingOverrides[definition.actionId];
                const effectiveNormalized = resolved.binding.normalized;

                return (
                  <div
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    key={definition.actionId}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {definition.description}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatShortcutLabel(effectiveNormalized)}
                      </p>
                    </div>
                    {canWrite ? (
                      <div className="flex items-center gap-2">
                        <ShortcutCapturePopover
                          actionId={definition.actionId}
                          allowFnKeyBindings={allowFnKeyBindings}
                          collisionContext={{
                            payload: draftPreview,
                            pendingOverrides,
                          }}
                          disabled={lockedActions.includes(definition.actionId)}
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
                            disabled={lockedActions.includes(
                              definition.actionId
                            )}
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
                            Reset
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {canWrite ? (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <p className="text-muted-foreground text-xs">
            {dirty ? "Unsaved policy changes" : "Policy is up to date"}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={!dirty || status === "pending"}
              onClick={discardDraft}
              type="button"
              variant="outline"
            >
              Discard
            </Button>
            <Button
              disabled={!dirty || status === "pending"}
              onClick={() => {
                savePolicy().catch(() => undefined);
              }}
              type="button"
            >
              Save tenant policy
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
