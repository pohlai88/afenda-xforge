import type { SystemAdminDomain } from "@repo/features-system-admin-control-plane";
import { listSystemAdminSections } from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { requireSystemAdminScope } from "../_lib/context.ts";

const systemAdminDomains = new Set<SystemAdminDomain>([
  "overview",
  "tenant-settings",
  "users-access",
  "customization-governance",
  "audit",
  "health-metrics",
  "integrations",
]);

export async function GET(request: Request): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    const url = new URL(request.url);
    const rawDomain = url.searchParams.get("domain");
    const query: { domain?: SystemAdminDomain } =
      rawDomain && systemAdminDomains.has(rawDomain as SystemAdminDomain)
        ? { domain: rawDomain as SystemAdminDomain }
        : {};
    return NextResponse.json(listSystemAdminSections(query, scope));
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sections failed",
      },
      { status: 403 }
    );
  }
}
