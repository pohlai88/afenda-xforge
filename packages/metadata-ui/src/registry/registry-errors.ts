export class MetadataRendererRegistryError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;

    Object.setPrototypeOf(this, new.target.prototype);

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class MetadataRendererRegistryDuplicateError extends MetadataRendererRegistryError {
  constructor(key: string) {
    super(`Renderer registry already contains a renderer for "${key}".`);
  }
}

export class MetadataRendererRegistryMissingError extends MetadataRendererRegistryError {
  constructor(key: string) {
    super(`Renderer registry does not contain a renderer for "${key}".`);
  }
}
