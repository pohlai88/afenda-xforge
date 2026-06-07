import { initializeSentry } from "@repo/observability/instrumentation";

export { onRequestError } from "@repo/observability/instrumentation";

export async function register(): Promise<void> {
  await initializeSentry();
}
