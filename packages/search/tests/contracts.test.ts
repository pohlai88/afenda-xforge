import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { clearSearchIndexRegistry } from "../index.ts";
import {
  createMeilisearchIndexer,
  createMeilisearchSearchClient,
} from "../meilisearch/index.ts";

beforeEach(() => {
  clearSearchIndexRegistry();
});

describe("search package contracts", () => {
  it("rejects invalid batch sizes before indexing", async () => {
    const indexer = createMeilisearchIndexer({
      host: "http://127.0.0.1:7700",
    });

    await expect(
      indexer.indexDocuments(
        "customers",
        [
          {
            id: "1",
            tenantId: "tenant-1",
          },
        ],
        0
      )
    ).rejects.toThrow(/batch size must be a positive integer/i);
  });

  it("rejects invalid search pagination before querying", async () => {
    const client = createMeilisearchSearchClient({
      host: "http://127.0.0.1:7700",
    });

    await expect(
      client.search({
        limit: 0,
        query: "alpha",
      })
    ).rejects.toThrow(/search limit must be a positive integer/i);

    await expect(
      client.search({
        offset: -1,
        query: "alpha",
      })
    ).rejects.toThrow(/search offset must be a non-negative integer/i);
  });

  it("returns no results for blank queries", async () => {
    const client = createMeilisearchSearchClient({
      host: "http://127.0.0.1:7700",
    });

    await expect(
      client.search({
        query: "   ",
      })
    ).resolves.toEqual([]);
  });

  it("fails fast when no indices are registered", async () => {
    const client = createMeilisearchSearchClient({
      host: "http://127.0.0.1:7700",
    });

    await expect(
      client.search({
        query: "alpha",
      })
    ).rejects.toThrow(/No search indices are registered/i);
  });
});
