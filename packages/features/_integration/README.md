# `@repo/erp-integration`

Reusable ERP orchestration and master-data support that lives under `packages/features/_integration`.

This package is support-only. It may compose approved feature `server.ts` entrypoints and provide shared master-data base services, but it must not own:

- metadata
- domain records
- persistence
- feature internals
- business rules

## Public Surface

- `runIntegrationFlow`
- `createIntegrationFlow`
- `IntegrationFlow`
- `IntegrationStep`
- `IntegrationFlowResult`
- `BaseMasterDataService`
- `MasterDataError`
- `MasterDataQuery`
- `SyncAction`
- `SyncConflict`
- `SyncEvent`
- `SyncResult`

## Usage Rule

Feature code may use this package when it needs shared orchestration glue or master-data primitives across feature families. The package itself must stay server-only and must not become a feature package or a metadata layer.
