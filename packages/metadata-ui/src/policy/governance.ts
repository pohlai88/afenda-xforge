import type {
  MetadataDiagnostic,
  MetadataDiagnosticCode,
  MetadataDiagnosticSeverity,
} from "../contracts/diagnostics.contract";
import type {
  MetadataGovernanceDecision,
  MetadataGovernancePolicy,
} from "../contracts/governance.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataCorrelationId } from "../contracts/render-context.defaults";

export type MetadataGovernanceTarget = "action" | "field" | "section";

export type MetadataGovernanceDiagnostic = MetadataDiagnostic & {
  fallback: true;
  rendererType: MetadataGovernanceTarget;
};

export type MetadataGovernanceEvaluation = {
  decision: MetadataGovernanceDecision;
  diagnostic?: MetadataGovernanceDiagnostic;
  disabled: boolean;
  allowed: boolean;
};

type EvaluateMetadataGovernanceInput = {
  context: MetadataRenderContext;
  disabled?: boolean;
  key: string;
  policy?: MetadataGovernancePolicy;
  readonly?: boolean;
  target: MetadataGovernanceTarget;
};

const resolveDeniedEffect = (
  policy: MetadataGovernancePolicy | undefined
): MetadataGovernanceDecision["effect"] => policy?.fallback ?? "forbidden";

const createDecision = (
  effect: MetadataGovernanceDecision["effect"],
  allowed: boolean,
  metadata: Record<string, unknown>,
  evaluatedPolicies: readonly MetadataGovernancePolicy[],
  diagnostics?: readonly string[],
  deniedReason?: string
): MetadataGovernanceDecision => ({
  effect,
  allowed,
  deniedReason,
  diagnostics,
  evaluatedAt: new Date().toISOString(),
  evaluatedPolicies,
  metadata,
});

const createGovernanceDiagnostic = (
  code: MetadataDiagnosticCode,
  key: string,
  message: string,
  rendererType: MetadataGovernanceTarget,
  severity: MetadataDiagnosticSeverity,
  details: Record<string, unknown>,
  correlationId?: string
): MetadataGovernanceDiagnostic => ({
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

export function evaluateMetadataGovernance({
  context,
  disabled = false,
  key,
  policy,
  readonly = false,
  target,
}: EvaluateMetadataGovernanceInput): MetadataGovernanceEvaluation {
  const policies = policy ? [policy] : [];
  const metadata = {
    auditAction: policy?.auditAction,
    capability: policy?.capability,
    disabled,
    featureId: policy?.featureId ?? context.featureId,
    featureFlag: policy?.featureFlag,
    key,
    moduleId: policy?.moduleId ?? context.moduleId,
    ownerPackage: policy?.ownerPackage,
    permission: policy?.permission,
    readonly,
    requestedFallback: policy?.fallback,
    severity: policy?.severity,
    target,
    telemetryEvent: policy?.telemetryEvent,
  };

  if (policy?.permission && !context.permissions[policy.permission]) {
    const effect = resolveDeniedEffect(policy);
    const diagnostic = createGovernanceDiagnostic(
      "missing-permission",
      key,
      `Missing permission '${policy.permission}' for metadata ${target} '${key}'.`,
      target,
      "error",
      metadata,
      context.correlationId
    );

    return {
      allowed: effect === "disable" || effect === "readonly",
      decision: createDecision(
        effect,
        effect === "disable" || effect === "readonly",
        metadata,
        policies,
        [diagnostic.code],
        diagnostic.message
      ),
      diagnostic,
      disabled: true,
    };
  }

  if (policy?.capability && !context.capabilities[policy.capability]) {
    const effect = resolveDeniedEffect(policy);
    const diagnostic = createGovernanceDiagnostic(
      "capability-mismatch",
      key,
      `Missing capability '${policy.capability}' for metadata ${target} '${key}'.`,
      target,
      "error",
      metadata,
      context.correlationId
    );

    return {
      allowed: effect === "disable" || effect === "readonly",
      decision: createDecision(
        effect,
        effect === "disable" || effect === "readonly",
        metadata,
        policies,
        [diagnostic.code],
        diagnostic.message
      ),
      diagnostic,
      disabled: true,
    };
  }

  if (policy?.featureFlag && !context.featureFlags[policy.featureFlag]) {
    const effect = resolveDeniedEffect(policy);
    const diagnostic = createGovernanceDiagnostic(
      "feature-flag-disabled",
      key,
      `Feature flag '${policy.featureFlag}' is disabled for metadata ${target} '${key}'.`,
      target,
      "warning",
      metadata,
      context.correlationId
    );

    return {
      allowed: effect === "disable" || effect === "readonly",
      decision: createDecision(
        effect,
        effect === "disable" || effect === "readonly",
        metadata,
        policies,
        [diagnostic.code],
        diagnostic.message
      ),
      diagnostic,
      disabled: true,
    };
  }

  if (readonly) {
    const diagnostic = createGovernanceDiagnostic(
      "readonly-mode",
      key,
      `Metadata ${target} '${key}' is rendered in readonly mode.`,
      target,
      "info",
      metadata,
      context.correlationId
    );

    return {
      allowed: true,
      decision: createDecision("readonly", true, metadata, policies, [
        diagnostic.code,
      ]),
      diagnostic,
      disabled: true,
    };
  }

  if (disabled) {
    const diagnostic = createGovernanceDiagnostic(
      "disabled-renderer",
      key,
      `Metadata ${target} '${key}' is disabled and will render in a disabled state.`,
      target,
      "info",
      metadata,
      context.correlationId
    );

    return {
      allowed: true,
      decision: createDecision("disable", true, metadata, policies, [
        diagnostic.code,
      ]),
      diagnostic,
      disabled: true,
    };
  }

  return {
    allowed: true,
    decision: createDecision("allow", true, metadata, policies),
    disabled: false,
  };
}
