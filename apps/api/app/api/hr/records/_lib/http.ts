import { NextResponse } from "next/server";

import type {
  HrRecordsApiReadContext,
  HrRecordsApiWriteContext,
} from "./context.ts";

export const hrRecordsRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const ensureHrRecordsReadAccess = (
  context: HrRecordsApiReadContext
): NextResponse | null =>
  context.canRead
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for employee records",
          ok: false,
        },
        { status: hrRecordsRouteResponsePolicy.blocked }
      );

export const ensureHrRecordsWriteAccess = (
  context: HrRecordsApiWriteContext
): NextResponse | null =>
  context.canWrite
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for employee records",
          ok: false,
        },
        { status: hrRecordsRouteResponsePolicy.blocked }
      );
