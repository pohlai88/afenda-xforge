import type {
  ColorModePreference,
  UserBrandingPreferences,
} from "@repo/design-system";

type PersistColorModeResult =
  | { ok: true; preferences: UserBrandingPreferences }
  | { ok: false; error: string };

export async function persistColorModePreferences(
  currentPreferences: UserBrandingPreferences,
  colorMode: ColorModePreference
): Promise<PersistColorModeResult> {
  const preferences: UserBrandingPreferences = {
    ...currentPreferences,
    colorMode,
  };

  try {
    const response = await fetch("/api/me/appearance", {
      body: JSON.stringify({ preferences }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      return {
        ok: false,
        error: payload.error ?? "Color mode update failed",
      };
    }

    const payload = (await response.json()) as {
      preferences: UserBrandingPreferences;
    };

    return { ok: true, preferences: payload.preferences };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Color mode update failed",
    };
  }
}
