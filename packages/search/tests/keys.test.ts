import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const originalEnvironment = {
  ...process.env,
};

beforeEach(() => {
  vi.resetModules();
  process.env = {
    ...originalEnvironment,
  };
});

afterEach(() => {
  process.env = {
    ...originalEnvironment,
  };
});

describe("Meilisearch env caching", () => {
  it("can reset cached Meilisearch env keys", async () => {
    process.env.MEILISEARCH_URL = "https://example-a.test";

    const module = await import("../meilisearch/keys.ts");
    expect(module.loadMeilisearchKeys().MEILISEARCH_URL).toBe(
      "https://example-a.test"
    );

    process.env.MEILISEARCH_URL = "https://example-b.test";
    expect(module.loadMeilisearchKeys().MEILISEARCH_URL).toBe(
      "https://example-a.test"
    );

    module.resetMeilisearchKeysCache();

    expect(module.loadMeilisearchKeys().MEILISEARCH_URL).toBe(
      "https://example-b.test"
    );
  });
});
