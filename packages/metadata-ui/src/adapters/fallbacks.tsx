import type { ReactElement } from "react";

import type {
  MetadataActionContract,
  MetadataActionRenderer,
  MetadataActionRendererProps,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import { resolveMetadataActionSurface } from "../contracts/action-renderer.contract";
import type {
  MetadataFieldRenderer,
  MetadataFieldRendererProps,
} from "../contracts/field-renderer.contract";
import type {
  MetadataSectionRenderer,
  MetadataSectionRendererProps,
} from "../contracts/section-renderer.contract";
import { ErrorState } from "../renderers/states/error-state.renderer";
import type { MetadataRendererDiagnostic } from "./diagnostics";

const createFallbackRenderer =
  <TProps,>(
    render: (
      props: TProps,
      diagnostic: MetadataRendererDiagnostic
    ) => ReactElement
  ) =>
  (diagnostic: MetadataRendererDiagnostic) =>
  (props: TProps): ReactElement =>
    render(props, diagnostic);

export const createMissingFieldRenderer = (
  diagnostic: MetadataRendererDiagnostic
): MetadataFieldRenderer =>
  createFallbackRenderer<MetadataFieldRendererProps>((props, fallback) => (
    <ErrorState
      description={fallback.message}
      title={`Unsupported field: ${props.field.label}`}
    />
  ))(diagnostic);

export const createMissingActionRenderer = (
  diagnostic: MetadataRendererDiagnostic
): MetadataActionRenderer =>
  createFallbackRenderer<MetadataActionRendererProps>((props, fallback) => (
    <ErrorState
      description={fallback.message}
      title={`Unsupported action: ${props.action.label}`}
    />
  ))(diagnostic);

export const createMissingSectionRenderer = (
  diagnostic: MetadataRendererDiagnostic
): MetadataSectionRenderer =>
  createFallbackRenderer<MetadataSectionRendererProps>((props, fallback) => (
    <ErrorState
      description={fallback.message}
      title={`Unsupported section: ${props.section.title}`}
    />
  ))(diagnostic);

export const resolveActionSurface = (
  actionOrSurface:
    | MetadataActionContract
    | MetadataActionSurface
    | string
    | undefined
): MetadataActionSurface =>
  typeof actionOrSurface === "string" || actionOrSurface === undefined
    ? ((actionOrSurface ?? "button") as MetadataActionSurface)
    : resolveMetadataActionSurface(actionOrSurface);
