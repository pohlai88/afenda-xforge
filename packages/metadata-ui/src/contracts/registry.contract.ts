import type { MetadataRendererDefinition } from "./renderer.contract";

export type MetadataRendererRegistration<TRenderer> = {
  capabilities?: readonly string[];
  deprecated?: boolean;
  experimental?: boolean;
  featureId?: string;
  key: string;
  moduleId?: string;
  priority?: number;
  renderer: TRenderer;
  version: string;
};

export type MetadataRendererRegistryEntry<TKey extends string, TRenderer> = {
  key: TKey;
  registration: MetadataRendererRegistration<TRenderer>;
};

export type MetadataRendererRegistry<TKey extends string, TRenderer> = {
  entries: () => readonly MetadataRendererRegistryEntry<TKey, TRenderer>[];
  get: (key: TKey) => MetadataRendererRegistration<TRenderer>;
  has: (key: TKey) => boolean;
  keys: () => readonly TKey[];
  register: (
    registration: MetadataRendererRegistration<TRenderer> & { key: TKey }
  ) => MetadataRendererRegistry<TKey, TRenderer>;
  resolve: (key: TKey) => MetadataRendererRegistration<TRenderer> | undefined;
};

export type MetadataRendererDefinitionRegistry<TContract> =
  MetadataRendererRegistry<string, MetadataRendererDefinition<TContract>>;
