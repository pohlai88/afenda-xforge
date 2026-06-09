import type { MetadataRendererRegistry } from "../contracts/registry.contract";
import {
  MetadataRendererRegistryDuplicateError,
  MetadataRendererRegistryMissingError,
} from "./registry-errors";

const cloneEntries = <TKey extends string, TRenderer>(
  entries: readonly (readonly [TKey, TRenderer])[]
): Map<TKey, TRenderer> => {
  const registry = new Map<TKey, TRenderer>();

  for (const [key, renderer] of entries) {
    if (registry.has(key)) {
      throw new MetadataRendererRegistryDuplicateError(key);
    }

    registry.set(key, renderer);
  }

  return registry;
};

export function createRendererRegistry<TKey extends string, TRenderer>(
  entries: readonly (readonly [TKey, TRenderer])[] = []
): MetadataRendererRegistry<TKey, TRenderer> {
  const registry = cloneEntries(entries);

  const build = (
    nextRegistry: Map<TKey, TRenderer>
  ): MetadataRendererRegistry<TKey, TRenderer> => ({
    entries: (): readonly (readonly [TKey, TRenderer])[] => [
      ...nextRegistry.entries(),
    ],
    get: (key: TKey): TRenderer => {
      const renderer = nextRegistry.get(key);

      if (!renderer) {
        throw new MetadataRendererRegistryMissingError(key);
      }

      return renderer;
    },
    has: (key: TKey): boolean => nextRegistry.has(key),
    keys: (): readonly TKey[] => [...nextRegistry.keys()],
    register: (
      key: TKey,
      renderer: TRenderer
    ): MetadataRendererRegistry<TKey, TRenderer> => {
      if (nextRegistry.has(key)) {
        throw new MetadataRendererRegistryDuplicateError(key);
      }

      const updatedRegistry = new Map(nextRegistry);
      updatedRegistry.set(key, renderer);

      return build(updatedRegistry);
    },
    resolve: (key: TKey): TRenderer | undefined => nextRegistry.get(key),
  });

  return build(registry);
}
