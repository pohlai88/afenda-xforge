export type MetadataDensityMode = "comfortable" | "compact" | "default";

export type MetadataComponentSize = "icon" | "lg" | "md" | "sm";

export type MetadataStatusTone =
  | "destructive"
  | "info"
  | "neutral"
  | "success"
  | "warning";

export type MetadataComponentVariant =
  | "default"
  | "destructive"
  | "ghost"
  | "info"
  | "link"
  | "muted"
  | "outline"
  | "secondary"
  | "success"
  | "warning";

export type MetadataPresentationContract = {
  density?: MetadataDensityMode;
  icon?: string;
  size?: MetadataComponentSize;
  tone?: MetadataStatusTone;
  variant?: MetadataComponentVariant;
};
