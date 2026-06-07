import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
