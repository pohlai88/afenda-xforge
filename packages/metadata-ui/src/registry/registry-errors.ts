export class MetadataRendererRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetadataRendererRegistryError";
  }
}

export class MetadataRendererRegistryDuplicateError extends MetadataRendererRegistryError {
  constructor(key: string) {
    super(`Renderer registry already contains a renderer for "${key}".`);
    this.name = "MetadataRendererRegistryDuplicateError";
  }
}

export class MetadataRendererRegistryMissingError extends MetadataRendererRegistryError {
  constructor(key: string) {
    super(`Renderer registry does not contain a renderer for "${key}".`);
    this.name = "MetadataRendererRegistryMissingError";
  }
}
