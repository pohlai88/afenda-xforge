export type MetadataDiagnosticSeverity = "debug" | "info" | "warning" | "error";

export type MetadataDiagnosticCode =
  | "capability-mismatch"
  | "deprecated-renderer"
  | "duplicate-renderer"
  | "disabled-renderer"
  | "feature-flag-disabled"
  | "invalid-contract"
  | "missing-permission"
  | "missing-renderer"
  | "readonly-mode"
  | "renderer-error"
  | "unsupported-state";

export type MetadataDiagnostic = {
  code: MetadataDiagnosticCode;
  correlationId: string;
  details?: Record<string, unknown>;
  message: string;
  severity: MetadataDiagnosticSeverity;
  target?: string;
  timestamp?: string;
};
