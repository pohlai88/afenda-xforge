import { captureRequestError } from "@sentry/nextjs";

export const onRequestError: typeof captureRequestError = captureRequestError;

export const initializeSentry = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeSentry: initServer } = await import("./server.ts");
    initServer();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initializeSentry: initEdge } = await import("./edge.ts");
    initEdge();
  }
};
