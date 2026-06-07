import { getErrorMessage } from "@repo/errors";
import { captureException } from "@sentry/nextjs";
import { log } from "./log.js";

export const parseError = (error: unknown): string => {
  const message = getErrorMessage(error);

  try {
    captureException(error);
    log.error(
      {
        error,
      },
      `Parsing error: ${message}`
    );
  } catch (newError) {
    console.error("Error parsing error:", newError);
  }

  return message;
};
