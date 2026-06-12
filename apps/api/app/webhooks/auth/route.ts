import { NextResponse } from "next/server";

import { rejectUnconfiguredWebhookRoute } from "../_lib/scaffold-guard.ts";

export function POST(): NextResponse {
  return rejectUnconfiguredWebhookRoute("auth");
}
