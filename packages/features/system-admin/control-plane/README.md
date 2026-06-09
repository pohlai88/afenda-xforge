# System Admin Control Plane

`@repo/features-system-admin-control-plane` is the governed system administration feature package for XForge.

It is a downstream feature surface, not a foundation package. It composes approved platform packages for tenant context, permissions, execution, audit, metadata, customization governance, health, and metrics.

The package intentionally defers a full UI route until the admin shell is finalized.

Current governed responsibilities include tenant-facing operational surfaces such as webhook endpoint management, even when the temporary API route lives under `apps/api`.
