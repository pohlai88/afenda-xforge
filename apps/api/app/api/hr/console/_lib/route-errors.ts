import { ForbiddenError } from "@repo/errors";

export const mapHrConsoleRouteError = (
  error: unknown,
  fallbackMessage: string
): { body: { error: string }; status: number } => {
  if (error instanceof ForbiddenError) {
    return {
      body: {
        error: error.message || "HR console access denied",
      },
      status: 403,
    };
  }

  if (error instanceof Error && error.message.includes("Invalid")) {
    return {
      body: {
        error: error.message,
      },
      status: 400,
    };
  }

  if (error instanceof Error) {
    return {
      body: {
        error: error.message || fallbackMessage,
      },
      status: 500,
    };
  }

  return {
    body: {
      error: fallbackMessage,
    },
    status: 500,
  };
};
