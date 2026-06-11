import { isAppError } from "@repo/errors";
import { NextResponse } from "next/server";
import { z } from "zod";

export const mapApiRouteError = (
  error: unknown,
  fallbackMessage: string
): NextResponse => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (isAppError(error)) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: fallbackMessage }, { status: 500 });
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
};
