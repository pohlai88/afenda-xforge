"use client";

import type {
  ErpVisualLaneId,
  TenantBrandingSettings,
  UserBrandingPreferences,
} from "@repo/design-system";
import { mergeEffectiveBranding } from "@repo/design-system";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";
import { useTenantBranding } from "../../../../_components/tenant-branding-context.tsx";
import {
  BrandingColorOverrides,
  countLaneColorOverrides,
} from "../../admin/branding/_components/branding-color-overrides.tsx";
import {
  BrandingFeatureColorOverrides,
  countFeatureColorOverrides,
} from "../../admin/branding/_components/branding-feature-color-overrides.tsx";
import { BrandingLaneMatrix } from "../../admin/branding/_components/branding-lane-matrix.tsx";
import { BrandingPresetGallery } from "../../admin/branding/_components/branding-preset-gallery.tsx";
import {
  extractUserLaneColorOverridesDelta,
  isUserPreferencesDirty,
  resolveAssignedLane,
} from "../../admin/branding/_components/branding-settings.utils.ts";

type AppearanceSettingsViewProps = {
  initialPreferences: UserBrandingPreferences;
};

type SaveStatus = "idle" | "pending" | "success" | "error";

export function AppearanceSettingsView({
  initialPreferences,
}: AppearanceSettingsViewProps): ReactElement {
  const router = useRouter();
  const { setUserPreferences, tenantBranding } = useTenantBranding();
  const [preferences, setPreferences] =
    useState<UserBrandingPreferences>(initialPreferences);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const dirty = isUserPreferencesDirty(preferences, initialPreferences);
  const previewBranding = mergeEffectiveBranding(tenantBranding, preferences);
  const overrideCount = Object.keys(
    preferences.moduleLaneOverrides ?? {}
  ).length;
  const colorOverrideCount =
    countLaneColorOverrides({
      themePreset: tenantBranding.themePreset,
      laneColorOverrides: preferences.laneColorOverrides,
    }) + countFeatureColorOverrides(previewBranding);

  const updateModuleLane = (featureId: string, laneId: ErpVisualLaneId) => {
    setStatus("idle");
    setMessage(null);
    setPreferences((current) => {
      const tenantLane = resolveAssignedLane(tenantBranding, featureId);
      const nextOverrides = { ...(current.moduleLaneOverrides ?? {}) };

      if (laneId === tenantLane) {
        const { [featureId]: _removed, ...remaining } = nextOverrides;
        return {
          ...current,
          moduleLaneOverrides:
            Object.keys(remaining).length > 0 ? remaining : undefined,
        };
      }

      return {
        ...current,
        moduleLaneOverrides: {
          ...nextOverrides,
          [featureId]: laneId,
        },
      };
    });
  };

  const resetDraft = (): void => {
    setPreferences(initialPreferences);
    setStatus("idle");
    setMessage(null);
  };

  const savePreferences = async (): Promise<void> => {
    setStatus("pending");
    setMessage(null);

    try {
      const response = await fetch("/api/me/appearance", {
        body: JSON.stringify({ preferences }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(
          payload.error ?? "Appearance preferences update failed"
        );
      }

      const payload = (await response.json()) as {
        preferences: UserBrandingPreferences;
      };

      setUserPreferences(payload.preferences);
      setStatus("success");
      setMessage(
        "Personal appearance saved. Brand and lane accents refresh now."
      );
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Appearance preferences update failed"
      );
    }
  };

  const updateEffectiveColorOverrides = (
    effective: TenantBrandingSettings
  ): void => {
    setStatus("idle");
    setMessage(null);
    setPreferences((current) => ({
      ...current,
      laneColorOverrides: extractUserLaneColorOverridesDelta(
        tenantBranding,
        effective
      ),
    }));
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="rounded-xl border border-lane-active-border bg-card/95 p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="lane">Personal scope</Badge>
            <Badge variant="neutral">Tenant baseline preserved</Badge>
            {dirty ? <Badge variant="warning">Unsaved changes</Badge> : null}
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              User preferences
            </p>
            <h1 className="font-semibold text-4xl tracking-tight">
              My appearance
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Customize your brand preset and module lane accents on top of the
              tenant defaults. Your choices apply only to your account in this
              tenant.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">
              Tenant preset: {tenantBranding.themePreset}
            </Badge>
            <Badge variant="outline">
              Color mode: {preferences.colorMode ?? "system"}
            </Badge>
            <Badge variant="outline">
              {overrideCount} personal lane overrides
            </Badge>
            <Badge variant="outline">
              {colorOverrideCount} personal color overrides
            </Badge>
          </div>
        </div>
      </header>

      {status === "success" && message ? (
        <Alert variant="success">
          <AlertTitle>Appearance saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {status === "error" && message ? (
        <Alert variant="destructive">
          <AlertTitle>Appearance update failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="presets">
        <TabsList variant="line">
          <TabsTrigger value="presets">My brand preset</TabsTrigger>
          <TabsTrigger value="lanes">My module lanes</TabsTrigger>
          <TabsTrigger value="colors">My lane colors</TabsTrigger>
          <TabsTrigger value="feature-colors">My module colors</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6 space-y-6" value="presets">
          <BrandingPresetGallery
            onSelect={(themePreset) => {
              setStatus("idle");
              setMessage(null);
              setPreferences((current) => ({ ...current, themePreset }));
            }}
            selectedPreset={
              preferences.themePreset ?? tenantBranding.themePreset
            }
          />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="lanes">
          <BrandingLaneMatrix
            branding={previewBranding}
            canWrite
            onLaneChange={updateModuleLane}
          />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="colors">
          <BrandingColorOverrides
            branding={previewBranding}
            canWrite
            onChange={updateEffectiveColorOverrides}
          />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="feature-colors">
          <BrandingFeatureColorOverrides
            branding={previewBranding}
            canWrite
            onChange={updateEffectiveColorOverrides}
          />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-sm">
            {dirty
              ? "Review and save personal appearance"
              : "Appearance is in sync"}
          </p>
          <p className="text-muted-foreground text-xs">
            Personal overrides layer on tenant branding without changing admin
            defaults.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={!dirty || status === "pending"}
            onClick={resetDraft}
            type="button"
            variant="outline"
          >
            Reset
          </Button>
          <Button
            disabled={!dirty || status === "pending"}
            onClick={savePreferences}
            type="button"
          >
            {status === "pending" ? "Saving…" : "Save appearance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
