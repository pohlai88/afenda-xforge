export type MetadataUiState =
  | "loading"
  | "empty"
  | "error"
  | "forbidden"
  | "ready";

export type MetadataRenderMode = "create" | "read" | "update";

export type MetadataRenderDensity = "compact" | "comfortable" | "default";

export type MetadataRenderContext = {
  density?: MetadataRenderDensity;
  mode: MetadataRenderMode;
  permissions: Record<string, boolean>;
  state: MetadataUiState;
};
