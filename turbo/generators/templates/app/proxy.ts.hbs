import { authMiddleware } from "@repo/auth/proxy";
import { createSecurityMiddleware } from "@repo/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const evaluateSecurity = createSecurityMiddleware();

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const authResponse = await authMiddleware(request);
  const assessment = await evaluateSecurity(request);

  if (!assessment.decision.allow) {
    const response = NextResponse.json(
      {
        error: assessment.decision.reason ?? "forbidden",
      },
      {
        status: 403,
      }
    );

    for (const cookie of authResponse.cookies.getAll()) {
      response.cookies.set(cookie.name, cookie.value, cookie);
    }

    for (const [key, value] of authResponse.headers.entries()) {
      response.headers.set(key, value);
    }

    for (const [key, value] of Object.entries(assessment.headers)) {
      response.headers.set(key, value);
    }

    return response;
  }

  for (const [key, value] of Object.entries(assessment.headers)) {
    authResponse.headers.set(key, value);
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api|trpc)(.*)"],
};
