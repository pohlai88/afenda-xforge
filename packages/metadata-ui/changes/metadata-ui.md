# Metadata-UI Change Notes

Use this file for package-local public API notes when the repo does not require a broader release-note system.

## 2026-06-09

- Date: 2026-06-09
- Change: Added verification-facing consumer fixture contract exports and tightened telemetry manifest governance fields for metadata-ui CI enforcement.
- Public impact: Downstream consumers keep the same runtime API; repo verification now expects fixture matrix coverage and the exported consumer scenario types are available for typed test helpers.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Keep future public fixture or telemetry schema changes paired with snapshot and change-note updates in the same PR.

## 2026-06-10

- Date: 2026-06-10
- Change: Added a manifest-driven metadata-ui generator for renderer registries, renderer exports, compatibility mappings, fixture coverage, and the README renderer catalog while keeping the existing public registry names stable.
- Public impact: Downstream consumers keep the same package entrypoints and runtime behavior, but renderer exports and registry inventory are now generated from `metadata-ui.manifest.ts` and the public fixture surface now exposes generated coverage helpers.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Keep future renderer inventory changes paired with manifest updates, regenerated outputs, and snapshot/change-note refreshes in the same change set.

## Entry template

- Date:
- Change:
- Public impact:
- Snapshot updated:
- Follow-up:
