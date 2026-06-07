# UI Boundary

`@repo/ui` owns reusable presentational components only.

Allowed ownership:
- presentational wrappers and composed UI controls
- enterprise state surfaces for loading, empty, error, and forbidden views
- app-facing component exports

Forbidden ownership:
- global CSS
- theme providers
- design-system utility ownership
- hooks or styling infrastructure directories

`@repo/ui` may compose primitives from `@repo/design-system`, but it should use explicit subpath imports such as:
- `@repo/design-system/components/*`
- `@repo/design-system/lib/utils`

It must not re-export the `@repo/design-system` root surface.

Recommended surface examples:
- `StatePanel` for standard empty / error / forbidden / recovery states
- `ActivityTable` for dense data grids with search, sorting, and pagination
- `DashboardGrid`, `KpiCard`, and `ModuleStatusGrid` for dashboard composition
