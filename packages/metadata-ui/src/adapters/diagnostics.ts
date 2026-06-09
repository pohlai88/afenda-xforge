import type {
  MetadataDiagnostic,
  MetadataDiagnosticCode,
  MetadataDiagnosticSeverity,
} from "../contracts/diagnostics.contract";
import { createMetadataCorrelationId } from "../contracts/render-context.defaults";

export type MetadataRendererResolutionKind =
  | "action"
  | "field"
  | "section"
  | "state";

export type MetadataRendererDiagnostic = MetadataDiagnostic & {
  fallback: true;
  rendererType: MetadataRendererResolutionKind;
};

type CreateRendererDiagnosticInput = {
  code: MetadataDiagnosticCode;
  correlationId?: string;
  details?: Record<string, unknown>;
  key: string;
  message: string;
  rendererType: MetadataRendererResolutionKind;
  severity: MetadataDiagnosticSeverity;
};

export const createRendererDiagnostic = ({
  code,
  correlationId,
  details,
  key,
  message,
  rendererType,
  severity,
}: CreateRendererDiagnosticInput): MetadataRendererDiagnostic => ({
  code,
  correlationId: correlationId ?? createMetadataCorrelationId(),
  details,
  fallback: true,
  message,
  rendererType,
  severity,
  target: key,
  timestamp: new Date().toISOString(),
});

export const createMissingRendererDiagnostic = (
  rendererType: MetadataRendererResolutionKind,
  key: string,
  fallbackKey: string
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "missing-renderer",
    details: { fallbackKey, rendererType },
    key,
    message: `No metadata ${rendererType} renderer is registered for '${key}'. Rendering fallback '${fallbackKey}'.`,
    rendererType,
    severity: "warning",
  });

export const createRendererErrorDiagnostic = (
  rendererType: MetadataRendererResolutionKind,
  key: string,
  error: unknown
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "renderer-error",
    details: {
      error: error instanceof Error ? error.message : String(error),
      rendererType,
    },
    key,
    message: `Rendering metadata ${rendererType} '${key}' failed.`,
    rendererType,
    severity: "error",
  });

export const bindRendererDiagnosticCorrelation = (
  diagnostic: MetadataRendererDiagnostic | undefined,
  correlationId: string
): MetadataRendererDiagnostic | undefined =>
  diagnostic
    ? {
        ...diagnostic,
        correlationId,
      }
    : undefined;

export const mergeRendererDiagnostics = (
  ...groups: readonly (readonly MetadataRendererDiagnostic[] | undefined)[]
): readonly MetadataRendererDiagnostic[] =>
  groups.flatMap((group) => group ?? []);
