type IdentityCarrier = {
  id?: string;
  key: string;
};

export type ResolvedMetadataNodeTarget<Item extends IdentityCarrier> = {
  canonicalId: string;
  driftedKey: boolean;
  matchKind: "id" | "key";
  metadataNode: Item;
};

type MetadataNodeIndex<Item extends IdentityCarrier> = {
  byCanonicalId: Map<string, Item>;
  byKey: Map<string, Item>;
};

export const getCanonicalMetadataNodeId = (node: IdentityCarrier): string =>
  node.id ?? node.key;

export const buildMetadataNodeIndex = <Item extends IdentityCarrier>(
  items: readonly Item[] | undefined
): MetadataNodeIndex<Item> => {
  const byCanonicalId = new Map<string, Item>();
  const byKey = new Map<string, Item>();

  for (const item of items ?? []) {
    byCanonicalId.set(getCanonicalMetadataNodeId(item), item);
    byKey.set(item.key, item);
  }

  return {
    byCanonicalId,
    byKey,
  };
};

export const resolveMetadataNodeTarget = <Item extends IdentityCarrier>(
  override: IdentityCarrier,
  index: MetadataNodeIndex<Item>
): ResolvedMetadataNodeTarget<Item> | null => {
  if (override.id) {
    const metadataNode = index.byCanonicalId.get(override.id);

    if (!metadataNode) {
      return null;
    }

    return {
      canonicalId: getCanonicalMetadataNodeId(metadataNode),
      driftedKey: override.key !== metadataNode.key,
      matchKind: "id",
      metadataNode,
    };
  }

  const metadataNode = index.byKey.get(override.key);

  if (!metadataNode) {
    return null;
  }

  return {
    canonicalId: getCanonicalMetadataNodeId(metadataNode),
    driftedKey: false,
    matchKind: "key",
    metadataNode,
  };
};
