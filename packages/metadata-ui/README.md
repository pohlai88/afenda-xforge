# Metadata UI Boundary

`@repo/metadata-ui` is the adapter layer between declarative metadata and the application-facing UI package.

It owns:

- metadata-to-UI adaptation helpers
- table and status rendering helpers
- entity metadata table composition
- enterprise table states such as loading, empty, error, and forbidden

It does not own:

- business rules
- tenant policy
- permissions
- mutation execution
- domain-specific persistence

Recommended usage:

- import `EntityMetadataPanel` for a full metadata-driven section shell
- import `EntityMetadataTable` for metadata-driven list surfaces
- import `renderMetadataStatus` for status chip rendering
- import `resolveStatusTone` when mapping metadata values to UI tones
- import `getMetadataSummary` when a page needs metadata counts or default sort labels

The package should stay declarative at the contract level and use `@repo/ui` for presentational surfaces.
