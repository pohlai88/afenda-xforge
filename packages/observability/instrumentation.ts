import { captureRequestError } from "@sentry/nextjs";

export const onRequestError = captureRequestError;

export const initializeSentry = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeSentry: initServer } = await import("./server.js");
    initServer();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initializeSentry: initEdge } = await import("./edge.js");
    initEdge();
  }
};
