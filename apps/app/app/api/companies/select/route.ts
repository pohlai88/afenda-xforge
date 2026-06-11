import {
  ACTIVE_COMPANY_COOKIE_NAME,
  requireActiveTenantAccess,
  requireCompanyAccess,
} from "@repo/auth/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";

const selectCompanyBodySchema = z.object({
  companyId: z.string().trim().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = selectCompanyBodySchema.parse(await request.json());
    const access = await requireActiveTenantAccess();

    await requireCompanyAccess({
      companyId: body.companyId,
      tenantId: access.membership.tenantId,
    });

    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_COMPANY_COOKIE_NAME, body.companyId, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ companyId: body.companyId });
  } catch (error) {
    return mapApiRouteError(error, "Company selection failed");
  }
}
