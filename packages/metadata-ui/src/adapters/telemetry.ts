import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type {
  MetadataTelemetryAttribute,
  MetadataTelemetryEvent,
} from "../contracts/telemetry.contract";

export type MetadataTelemetryEventInput = Omit<
  MetadataTelemetryEvent,
  "correlationId" | "name" | "timestamp"
> & {
  attributes?: Record<string, MetadataTelemetryAttribute>;
};

export function emitMetadataTelemetry(
  context: MetadataRenderContext,
  name: string,
  event: MetadataTelemetryEventInput = {}
): void {
  const sink = context.telemetry;

  if (!sink) {
    return;
  }

  try {
    sink.emit({
      ...event,
      correlationId: context.correlationId,
      featureId: event.featureId ?? context.featureId,
      moduleId: event.moduleId ?? context.moduleId,
      name,
      routeId: event.routeId ?? context.routeId,
      surfaceId: event.surfaceId ?? context.surfaceId,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Telemetry must never break rendering.
  }
}
