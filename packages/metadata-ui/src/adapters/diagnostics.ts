import type {
  MetadataDiagnostic,
  MetadataDiagnosticCode,
  MetadataDiagnosticSeverity,
} from "../contracts/diagnostics.contract";
import { createMetadataCorrelationId } from "../contracts/render-context.defaults";

export type MetadataRendererResolutionKind =
  | "action"
  | "composition"
  | "field"
  | "layout"
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

export const createInvalidContractDiagnostic = (
  rendererType: MetadataRendererResolutionKind,
  key: string,
  message: string,
  details?: Record<string, unknown>
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "invalid-contract",
    details,
    key,
    message,
    rendererType,
    severity: "error",
  });

export const createDeprecatedRendererDiagnostic = (
  rendererType: MetadataRendererResolutionKind,
  key: string,
  version?: string
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "deprecated-renderer",
    details: version ? { version } : undefined,
    key,
    message: `Metadata ${rendererType} renderer '${key}' is deprecated${version ? ` (version ${version})` : ""}.`,
    rendererType,
    severity: "warning",
  });

export const createDuplicateRendererDiagnostic = (
  rendererType: MetadataRendererResolutionKind,
  key: string
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "duplicate-renderer",
    details: { rendererType },
    key,
    message: `Duplicate metadata ${rendererType} renderer registration detected for '${key}'.`,
    rendererType,
    severity: "error",
  });

export const createUnsupportedStateDiagnostic = (
  state: string
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "unsupported-state",
    details: { state },
    key: state,
    message: `Metadata state '${state}' is not supported by the state registry.`,
    rendererType: "state",
    severity: "error",
  });

export const createUnsupportedRendererVersionDiagnostic = (
  rendererType: MetadataRendererResolutionKind,
  key: string,
  registrationVersion: string,
  constraint: { exact?: string; min?: string }
): MetadataRendererDiagnostic =>
  createRendererDiagnostic({
    code: "unsupported-renderer-version",
    details: {
      constraint,
      registrationVersion,
      rendererType,
    },
    key,
    message: `Metadata ${rendererType} renderer '${key}' version '${registrationVersion}' does not satisfy the active version constraint.`,
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
