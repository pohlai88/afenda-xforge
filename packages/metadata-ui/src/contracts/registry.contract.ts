export type MetadataRendererRegistry<TKey extends string, TRenderer> = {
  entries: () => readonly (readonly [TKey, TRenderer])[];
  get: (key: TKey) => TRenderer;
  has: (key: TKey) => boolean;
  keys: () => readonly TKey[];
  register: (
    key: TKey,
    renderer: TRenderer
  ) => MetadataRendererRegistry<TKey, TRenderer>;
  resolve: (key: TKey) => TRenderer | undefined;
};
