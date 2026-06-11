import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import type { ReactElement } from "react";
import { readUserAppearancePreferences } from "../../../../lib/user-appearance/repository.server";
import { AuthenticatedFeatureScope } from "../../../_components/authenticated-feature-scope.tsx";
import { resolveRuntimeTenantAccess } from "../../../_runtime-access.ts";
import { AppearanceSettingsView } from "./appearance-settings-view.tsx";

const APPEARANCE_FEATURE_ID = "system-admin.tenant-settings";

export default async function AppearanceSettingsPage(): Promise<ReactElement> {
  try {
    const access = await resolveRuntimeTenantAccess();
    const preferences = await readUserAppearancePreferences(
      access.tenantId,
      access.actorId
    );

    return (
      <AuthenticatedFeatureScope featureId={APPEARANCE_FEATURE_ID}>
        <AppearanceSettingsView initialPreferences={preferences} />
      </AuthenticatedFeatureScope>
    );
  } catch (error) {
    return (
      <MetadataStateBoundary
        error={
          error instanceof Error
            ? error.message
            : "Appearance settings could not be loaded."
        }
        state="error"
      />
    );
  }
}
