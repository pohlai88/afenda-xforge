import { requireActiveTenantMembership } from "@repo/auth/server";
import { userBrandingPreferencesSchema } from "@repo/design-system";
import { NextResponse } from "next/server";
import {
  readUserAppearancePreferences,
  upsertUserAppearancePreferences,
} from "../../../../lib/user-appearance/repository.server";

export async function GET(): Promise<NextResponse> {
  const membership = await requireActiveTenantMembership();
  const preferences = await readUserAppearancePreferences(
    membership.tenantId,
    membership.userId
  );

  return NextResponse.json({ preferences });
}

export async function POST(request: Request): Promise<NextResponse> {
  const membership = await requireActiveTenantMembership();

  try {
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "User appearance preferences update failed",
      },
      { status: 400 }
    );
  }
}
