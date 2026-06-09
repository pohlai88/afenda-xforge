# Metadata UI Boundary

`@repo/metadata-ui` converts metadata contracts into rendered UI.

It owns rendering behavior, not business authority.

## Scope

- metadata contract -> renderer -> ui primitive -> screen section
- state-boundary rendering for loading, empty, error, forbidden, and ready states
- registry-driven field, action, and section composition
- metadata-driven table and panel surfaces

## Allowed Dependencies

- `@repo/metadata-ui -> @repo/metadata`
- `@repo/metadata-ui -> @repo/ui`
- `@repo/metadata-ui -> design-system types via @repo/ui only`

## Forbidden Dependencies

- `@repo/metadata-ui -> @repo/database`
- `@repo/metadata-ui -> @repo/auth`
- `@repo/metadata-ui -> @repo/execution`
- `@repo/metadata-ui -> @repo/audit`
- `@repo/metadata-ui -> feature internals`
- `@repo/metadata-ui -> direct server actions`

## Notes

- Permission finality must stay server-side.
- UI may hide or disable actions, but the server must always re-check permissions before execution.
- The package owns a local `MetadataUiState` contract because the shared metadata package currently exposes entity metadata, not UI state.
