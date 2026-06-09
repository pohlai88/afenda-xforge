import type {
  MetadataRendererRegistration,
  MetadataRendererRegistry,
  MetadataRendererRegistryEntry,
} from "../contracts/registry.contract";
import {
  MetadataRendererRegistryDuplicateError,
  MetadataRendererRegistryMissingError,
} from "./registry-errors.ts";

const cloneEntries = <TKey extends string, TRenderer>(
  entries: readonly MetadataRendererRegistration<TRenderer>[]
): Map<TKey, MetadataRendererRegistration<TRenderer>> => {
  const registry = new Map<TKey, MetadataRendererRegistration<TRenderer>>();

  for (const registration of entries) {
    if (registry.has(registration.key as TKey)) {
      throw new MetadataRendererRegistryDuplicateError(
        registration.key as TKey
      );
    }

    registry.set(registration.key as TKey, registration);
  }

  return registry;
};

const getRegistrationOrThrow = <TKey extends string, TRenderer>(
  registry: Map<TKey, MetadataRendererRegistration<TRenderer>>,
  key: TKey
): MetadataRendererRegistration<TRenderer> => {
  const registration = registry.get(key);

  if (registration === undefined) {
    throw new MetadataRendererRegistryMissingError(key);
  }

  return registration;
};

const toRegistryEntries = <TKey extends string, TRenderer>(
  registry: Map<TKey, MetadataRendererRegistration<TRenderer>>
): readonly MetadataRendererRegistryEntry<TKey, TRenderer>[] =>
  [...registry.entries()].map(([key, registration]) => ({ key, registration }));

export function createRendererRegistry<TKey extends string, TRenderer>(
  registrations: readonly MetadataRendererRegistration<TRenderer>[] = []
): MetadataRendererRegistry<TKey, TRenderer> {
  const registry = cloneEntries<TKey, TRenderer>(registrations);

  const build = (
    nextRegistry: Map<TKey, MetadataRendererRegistration<TRenderer>>
  ): MetadataRendererRegistry<TKey, TRenderer> => ({
    entries: (): readonly MetadataRendererRegistryEntry<TKey, TRenderer>[] =>
      toRegistryEntries(nextRegistry),
    get: (key: TKey): MetadataRendererRegistration<TRenderer> =>
      getRegistrationOrThrow(nextRegistry, key),
    has: (key: TKey): boolean => nextRegistry.has(key),
    keys: (): readonly TKey[] => [...nextRegistry.keys()],
    register: (
      registration: MetadataRendererRegistration<TRenderer> & { key: TKey }
    ): MetadataRendererRegistry<TKey, TRenderer> => {
      if (nextRegistry.has(registration.key)) {
        throw new MetadataRendererRegistryDuplicateError(registration.key);
      }

      const updatedRegistry = new Map(nextRegistry);
      updatedRegistry.set(registration.key, registration);

      return build(updatedRegistry);
    },
    resolve: (key: TKey): MetadataRendererRegistration<TRenderer> | undefined =>
      nextRegistry.get(key),
  });

  return build(registry);
}
