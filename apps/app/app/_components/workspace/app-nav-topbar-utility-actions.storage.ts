import {
  APP_NAV_TOPBAR_UTILITY_CATALOG,
  APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
  APP_NAV_TOPBAR_UTILITY_MAX_PINNED,
  isAppNavTopbarUtilityId,
  type AppNavTopbarUtilityId,
} from "./app-nav-topbar-utility-actions.catalog.ts";

export type AppNavTopbarUtilitiesState = {
  order: AppNavTopbarUtilityId[];
  visible: AppNavTopbarUtilityId[];
};

export type TopbarUtilitiesScope = {
  tenantId: string;
  userId: string;
};

const LEGACY_STORAGE_KEY = "afenda.workspace.topbar.utilities";
const STORAGE_KEY_PREFIX = "afenda.workspace.topbar.utilities";

export const DEFAULT_TOPBAR_UTILITIES_SCOPE: TopbarUtilitiesScope = {
  tenantId: "anonymous",
  userId: "anonymous",
};

const listeners = new Set<() => void>();

function allCatalogIds(): AppNavTopbarUtilityId[] {
  return APP_NAV_TOPBAR_UTILITY_CATALOG.map((entry) => entry.id);
}

export function getTopbarUtilitiesStorageKey(
  scope: TopbarUtilitiesScope
): string {
  return `${STORAGE_KEY_PREFIX}:${scope.tenantId}:${scope.userId}`;
}

function isTopbarUtilitiesStorageKey(key: string | null): boolean {
  return (
    key === LEGACY_STORAGE_KEY ||
    (key?.startsWith(`${STORAGE_KEY_PREFIX}:`) ?? false)
  );
}

function normalizeOrder(value: unknown): AppNavTopbarUtilityId[] {
  const catalogIds = allCatalogIds();
  const seen = new Set<AppNavTopbarUtilityId>();
  const normalized: AppNavTopbarUtilityId[] = [];

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry !== "string" || !isAppNavTopbarUtilityId(entry)) {
        continue;
      }

      if (seen.has(entry)) {
        continue;
      }

      seen.add(entry);
      normalized.push(entry);
    }
  }

  for (const id of catalogIds) {
    if (!seen.has(id)) {
      normalized.push(id);
    }
  }

  return normalized;
}

export function normalizeVisible(
  value: unknown,
  order: readonly AppNavTopbarUtilityId[]
): AppNavTopbarUtilityId[] {
  if (!Array.isArray(value)) {
    return [...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED];
  }

  if (value.length === 0) {
    return [];
  }

  const visibleSet = new Set<AppNavTopbarUtilityId>();

  for (const entry of value) {
    if (typeof entry !== "string" || !isAppNavTopbarUtilityId(entry)) {
      continue;
    }

    visibleSet.add(entry);
  }

  return order
    .filter((id) => visibleSet.has(id))
    .slice(0, APP_NAV_TOPBAR_UTILITY_MAX_PINNED);
}

function normalizeState(value: unknown): AppNavTopbarUtilitiesState {
  if (Array.isArray(value)) {
    const visible = normalizeVisible(value, allCatalogIds());
    const order = normalizeOrder([
      ...visible,
      ...allCatalogIds().filter((id) => !visible.includes(id)),
    ]);

    return { order, visible: normalizeVisible(value, order) };
  }

  if (value && typeof value === "object") {
    const record = value as Partial<AppNavTopbarUtilitiesState>;
    const order = normalizeOrder(record.order);
    const visible = normalizeVisible(record.visible, order);

    return { order, visible };
  }

  return {
    order: normalizeOrder(allCatalogIds()),
    visible: [...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED],
  };
}

const TOPBAR_UTILITIES_SERVER_SNAPSHOT = normalizeState(null);
const PINNED_TOPBAR_UTILITIES_SERVER_SNAPSHOT = getTopbarVisibleUtilityIds(
  TOPBAR_UTILITIES_SERVER_SNAPSHOT
);

const snapshotCache = new Map<
  string,
  { marker: string; snapshot: AppNavTopbarUtilitiesState }
>();

function readRawStorage(scope: TopbarUtilitiesScope): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = getTopbarUtilitiesStorageKey(scope);
  const scoped = window.localStorage.getItem(storageKey);

  if (scoped) {
    return scoped;
  }

  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!legacy) {
    return null;
  }

  window.localStorage.setItem(storageKey, legacy);
  return legacy;
}

function refreshClientSnapshotFromStorage(
  scope: TopbarUtilitiesScope
): AppNavTopbarUtilitiesState {
  if (typeof window === "undefined") {
    return TOPBAR_UTILITIES_SERVER_SNAPSHOT;
  }

  const storageKey = getTopbarUtilitiesStorageKey(scope);
  const raw = readRawStorage(scope);
  const storageMarker = raw ?? "";

  const cached = snapshotCache.get(storageKey);

  if (cached && cached.marker === storageMarker) {
    return cached.snapshot;
  }

  if (!raw) {
    snapshotCache.set(storageKey, {
      marker: storageMarker,
      snapshot: TOPBAR_UTILITIES_SERVER_SNAPSHOT,
    });
    return TOPBAR_UTILITIES_SERVER_SNAPSHOT;
  }

  try {
    const snapshot = normalizeState(JSON.parse(raw));
    snapshotCache.set(storageKey, { marker: storageMarker, snapshot });
    return snapshot;
  } catch {
    snapshotCache.set(storageKey, {
      marker: storageMarker,
      snapshot: TOPBAR_UTILITIES_SERVER_SNAPSHOT,
    });
    return TOPBAR_UTILITIES_SERVER_SNAPSHOT;
  }
}

function invalidateSnapshotCache(storageKey?: string): void {
  if (storageKey) {
    snapshotCache.delete(storageKey);
    return;
  }

  snapshotCache.clear();
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function normalizeTopbarUtilitiesState(
  state: AppNavTopbarUtilitiesState
): AppNavTopbarUtilitiesState {
  return normalizeState(state);
}

export function getTopbarUtilitiesServerSnapshot(): AppNavTopbarUtilitiesState {
  return TOPBAR_UTILITIES_SERVER_SNAPSHOT;
}

export function getPinnedTopbarUtilitiesServerSnapshot(): AppNavTopbarUtilityId[] {
  return PINNED_TOPBAR_UTILITIES_SERVER_SNAPSHOT;
}

export function subscribeTopbarUtilities(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  const onStorage = (event: StorageEvent): void => {
    if (!isTopbarUtilitiesStorageKey(event.key)) {
      return;
    }

    invalidateSnapshotCache(event.key ?? undefined);
    onStoreChange();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(onStoreChange);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export const subscribePinnedTopbarUtilities = subscribeTopbarUtilities;

export function readTopbarUtilitiesState(
  scope: TopbarUtilitiesScope = DEFAULT_TOPBAR_UTILITIES_SCOPE
): AppNavTopbarUtilitiesState {
  return refreshClientSnapshotFromStorage(scope);
}

export function writeTopbarUtilitiesState(
  state: AppNavTopbarUtilitiesState,
  scope: TopbarUtilitiesScope = DEFAULT_TOPBAR_UTILITIES_SCOPE
): AppNavTopbarUtilitiesState {
  const normalized = normalizeState(state);

  if (typeof window !== "undefined") {
    const storageKey = getTopbarUtilitiesStorageKey(scope);
    const serialized = JSON.stringify(normalized);
    window.localStorage.setItem(storageKey, serialized);
    snapshotCache.set(storageKey, {
      marker: serialized,
      snapshot: normalized,
    });
    emitChange();
  }

  return normalized;
}

export function getTopbarVisibleUtilityIds(
  state: AppNavTopbarUtilitiesState
): AppNavTopbarUtilityId[] {
  const visibleSet = new Set(state.visible);

  return state.order.filter((id) => visibleSet.has(id));
}

/** @deprecated Use normalizeVisible */
export function normalizePinnedIds(value: unknown): AppNavTopbarUtilityId[] {
  return normalizeVisible(value, allCatalogIds());
}

export function readPinnedTopbarUtilities(
  scope: TopbarUtilitiesScope = DEFAULT_TOPBAR_UTILITIES_SCOPE
): AppNavTopbarUtilityId[] {
  return getTopbarVisibleUtilityIds(readTopbarUtilitiesState(scope));
}

export function writePinnedTopbarUtilities(
  pinnedIds: readonly AppNavTopbarUtilityId[],
  scope: TopbarUtilitiesScope = DEFAULT_TOPBAR_UTILITIES_SCOPE
): void {
  const current = readTopbarUtilitiesState(scope);
  const visible = normalizeVisible(pinnedIds, current.order);

  writeTopbarUtilitiesState(
    {
      order: normalizeOrder([
        ...visible,
        ...current.order.filter((id) => !visible.includes(id)),
      ]),
      visible,
    },
    scope
  );
}
