# Metadata-UI API Change Flow

When a public API change is intentional, the same pull request must update all of the following:

1. `snapshots/declaration-snapshot.json`
2. a package-local change note in this directory
3. any affected public-fixture or telemetry verification files

## Update steps

1. Make the public API change.
2. Run `pnpm --filter @repo/metadata-ui update:declaration-snapshot`.
3. Add or update a note in `changes/metadata-ui.md`.
4. Run `pnpm --filter @repo/metadata-ui verify`.

This package keeps declaration snapshots as the source of truth for public API drift. A snapshot update without a change note is incomplete governance.
