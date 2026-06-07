import { NextResponse } from "next/server";

export function POST(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
