import { requireActiveTenantMembership } from "@repo/auth/server";
import { afendaUserBrandingPreferencesSchema as userBrandingPreferencesSchema } from "@repo/design-system/contracts/afenda/customization";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";
import {
  readUserAppearancePreferences,
  upsertUserAppearancePreferences,
} from "../../../../lib/user-appearance/repository.server";

export async function GET(): Promise<NextResponse> {
  try {
    const membership = await requireActiveTenantMembership();
    const preferences = await readUserAppearancePreferences(
      membership.tenantId,
      membership.userId
    );

    return NextResponse.json({ preferences });
  } catch (error) {
    return mapApiRouteError(error, "User appearance preferences read failed");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const membership = await requireActiveTenantMembership();
    const payload = (await request.json()) as { preferences?: unknown };
    const preferences = userBrandingPreferencesSchema.parse(
      payload.preferences ?? {}
    );
    const saved = await upsertUserAppearancePreferences(
      membership.tenantId,
      membership.userId,
      preferences
    );

    return NextResponse.json({ preferences: saved });
  } catch (error) {
    return mapApiRouteError(error, "User appearance preferences update failed");
  }
}
