# Metadata-UI Diagnostics Policy

## UI-visible severities
- `warning`: allowed in UI when the renderer can continue with a governed fallback such as `readonly`, `disable`, `hide`, or `forbidden`.
- `error`: allowed in UI only through stable fallback surfaces such as error state panels or renderer-level error placeholders.

## Telemetry-only severities
- `info`: telemetry only.
- `debug`: telemetry only.

## Internal-only details
- Raw policy payloads, permission maps, and secret-bearing evaluation inputs must not be surfaced in UI diagnostics.
- Diagnostics metadata must remain safe for browser inspection and support correlation through `correlationId`.

## Governance payload handling
- UI may render the user-safe message from a governance diagnostic.
- Full governance decisions are telemetry-safe, not UI-safe by default.

## Operational rule
- Diagnostics must never block rendering.
- Telemetry emission must never throw through to the render path.
