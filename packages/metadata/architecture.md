# Metadata Architecture

`@repo/metadata` owns declarative contracts only.

It describes:

- fields
- sections
- tables
- forms
- actions
- states
- presentation hints
- filters
- columns

It does not render UI.

It does not run mutations.

It does not decide permission finality.

XForge metadata may define presentation, field labels, table columns, filters, validation hints, and simple workflow configuration, but must not define accounting rules, payroll rules, inventory valuation, approval authority, permission finality, or security enforcement.

Package rules:

- allowed: `metadata -> zod`
- allowed: `metadata -> design-system types only`
- forbidden: `metadata -> ui`
- forbidden: `metadata -> metadata-ui`
- forbidden: `metadata -> database`
- forbidden: `metadata -> auth`
- forbidden: `metadata -> execution`
- forbidden: `metadata -> permissions`
- forbidden: `metadata -> features`

The intended split is:

```txt
metadata     -> declarative contracts
metadata-ui  -> metadata renderer
ui           -> presentational primitives
design-system -> design vocabulary
```
