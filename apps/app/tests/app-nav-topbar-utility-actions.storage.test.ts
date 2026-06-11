import { afterEach, describe, expect, it } from "vitest";
import {
  APP_NAV_TOPBAR_UTILITY_CATALOG,
  APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
  APP_NAV_TOPBAR_UTILITY_MAX_PINNED,
} from "../app/_components/workspace/app-nav-topbar-utility-actions.catalog.ts";
import {
  DEFAULT_TOPBAR_UTILITIES_SCOPE,
  getPinnedTopbarUtilitiesServerSnapshot,
  getTopbarUtilitiesStorageKey,
  getTopbarVisibleUtilityIds,
  normalizePinnedIds,
  normalizeVisible,
  readPinnedTopbarUtilities,
  readTopbarUtilitiesState,
  writePinnedTopbarUtilities,
  writeTopbarUtilitiesState,
  type TopbarUtilitiesScope,
} from "../app/_components/workspace/app-nav-topbar-utility-actions.storage.ts";

const LEGACY_STORAGE_KEY = "afenda.workspace.topbar.utilities";
const catalogOrder = APP_NAV_TOPBAR_UTILITY_CATALOG.map((entry) => entry.id);
const testScope: TopbarUtilitiesScope = {
  tenantId: "tenant-test",
  userId: "user-test",
};

describe("normalizePinnedIds", () => {
  it("returns defaults for invalid input", () => {
    expect(normalizePinnedIds(null)).toEqual([
      ...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
    ]);
    expect(normalizePinnedIds("invalid")).toEqual([
      ...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
    ]);
  });

  it("filters unknown ids and deduplicates", () => {
    expect(
      normalizePinnedIds([
        "keyboard-shortcuts",
        "unknown",
        "keyboard-shortcuts",
        "search",
      ])
    ).toEqual(["keyboard-shortcuts", "search"]);
  });

  it("caps pinned utilities at six", () => {
    const ids = [
      "keyboard-shortcuts",
      "network-diagnosis",
      "messenger",
      "search",
      "calendar",
      "clipboard-list",
      "line-chart",
      "settings",
    ];

    expect(normalizePinnedIds(ids).length).toBe(
      APP_NAV_TOPBAR_UTILITY_MAX_PINNED
    );
  });

  it("allows an empty pinned set", () => {
    expect(normalizePinnedIds([])).toEqual([]);
  });
});

describe("topbar utilities storage", () => {
  afterEach(() => {
    window.localStorage.removeItem(getTopbarUtilitiesStorageKey(testScope));
    window.localStorage.removeItem(
      getTopbarUtilitiesStorageKey(DEFAULT_TOPBAR_UTILITIES_SCOPE)
    );
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  });

  it("reads defaults when storage is empty", () => {
    expect(readPinnedTopbarUtilities(testScope)).toEqual([
      ...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
    ]);
  });

  it("writes and reads pinned utilities per tenant and user", () => {
    writePinnedTopbarUtilities(["search", "settings"], testScope);
    expect(readPinnedTopbarUtilities(testScope)).toEqual([
      "settings",
      "search",
    ]);
  });

  it("isolates preferences between tenant and user scopes", () => {
    writePinnedTopbarUtilities(["search"], {
      tenantId: "tenant-a",
      userId: "user-a",
    });
    writePinnedTopbarUtilities(["settings"], {
      tenantId: "tenant-b",
      userId: "user-b",
    });

    expect(
      readPinnedTopbarUtilities({ tenantId: "tenant-a", userId: "user-a" })
    ).toEqual(["search"]);
    expect(
      readPinnedTopbarUtilities({ tenantId: "tenant-b", userId: "user-b" })
    ).toEqual(["settings"]);
  });

  it("persists empty pinned sets", () => {
    writePinnedTopbarUtilities([], testScope);
    expect(readPinnedTopbarUtilities(testScope)).toEqual([]);
  });

  it("uses stable server snapshot defaults", () => {
    expect(getPinnedTopbarUtilitiesServerSnapshot()).toEqual([
      ...APP_NAV_TOPBAR_UTILITY_DEFAULT_PINNED,
    ]);
  });

  it("persists full order and derives topbar visibility from it", () => {
    writeTopbarUtilitiesState(
      {
        order: ["settings", "search", ...catalogOrder.filter(
          (id) => id !== "settings" && id !== "search"
        )],
        visible: ["search", "settings"],
      },
      testScope
    );

    expect(readTopbarUtilitiesState(testScope).order.slice(0, 2)).toEqual([
      "settings",
      "search",
    ]);
    expect(readPinnedTopbarUtilities(testScope)).toEqual([
      "settings",
      "search",
    ]);
  });

  it("orders visible utilities by the saved list order", () => {
    const state = readTopbarUtilitiesState(testScope);

    writeTopbarUtilitiesState(
      {
        order: ["calendar", "messenger", ...state.order.filter(
          (id) => id !== "calendar" && id !== "messenger"
        )],
        visible: ["messenger", "calendar"],
      },
      testScope
    );

    expect(getTopbarVisibleUtilityIds(readTopbarUtilitiesState(testScope))).toEqual(
      ["calendar", "messenger"]
    );
  });

  it("migrates legacy pinned arrays into scoped order + visible state", () => {
    window.localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify(["messenger", "search"])
    );

    expect(readPinnedTopbarUtilities(DEFAULT_TOPBAR_UTILITIES_SCOPE)).toEqual([
      "messenger",
      "search",
    ]);
    expect(
      window.localStorage.getItem(
        getTopbarUtilitiesStorageKey(DEFAULT_TOPBAR_UTILITIES_SCOPE)
      )
    ).toBe(JSON.stringify(["messenger", "search"]));
  });

  it("keeps explicit empty visible sets", () => {
    expect(normalizeVisible([], catalogOrder)).toEqual([]);
  });
});
