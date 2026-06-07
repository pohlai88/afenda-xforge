# `@repo/api`

Contract-first API helpers for client-facing routes.

## Governance intent

Use this package for real feature endpoints that external clients or frontend code depend on.

The route contract should be the source of truth for:

- request validation
- success response validation
- route metadata
- OpenAPI operation generation

## Standard pattern

1. Define the route contract in a feature `contract.ts`.
2. Implement business behavior in the feature `server.ts`.
3. Create the route handler with `createContractRoute(...)`.
4. Register the same contract in the app OpenAPI document with `addRouteContractToOpenApi(...)`.

## Success response shape

Client-facing JSON routes should return:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Errors should continue to use the shared `@repo/errors` response shape.
