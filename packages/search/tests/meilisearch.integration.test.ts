import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SearchDocument } from "../index.ts";
import {
  buildSearchIndexName,
  clearSearchIndexRegistry,
  registerSearchIndex,
} from "../index.ts";
import { getMeilisearchClient } from "../meilisearch/client.ts";
import {
  createMeilisearchIndexer,
  createMeilisearchSearchClient,
} from "../meilisearch/index.ts";

const meilisearchUrl = process.env.MEILISEARCH_URL;
const meilisearchApiKey = process.env.MEILISEARCH_API_KEY;
const integrationEnabled = process.env.MEILISEARCH_INTEGRATION === "true";
const integrationSuite = integrationEnabled ? describe : describe.skip;
const indexPrefix = "itest";

const waitForTask = async (taskUid: number): Promise<void> => {
  const client = getMeilisearchClient({
    apiKey: meilisearchApiKey,
    host: meilisearchUrl,
    indexPrefix,
  });

  await client.tasks.waitForTask(taskUid);
};

integrationSuite("Meilisearch integration", () => {
  it("creates, indexes, searches, suggests, and cleans up documents", async () => {
    const indexKey = `projects_${randomUUID().replaceAll("-", "")}`;
    const indexName = buildSearchIndexName(indexKey, indexPrefix);
    const documents: readonly SearchDocument[] = [
      {
        createdAt: "2026-01-01T00:00:00.000Z",
        description: "Initial planning note",
        id: "1",
        tenantId: "tenant-a",
        title: "Alpha Project",
      },
      {
        createdAt: "2026-01-02T00:00:00.000Z",
        description: "Implementation workstream",
        id: "2",
        tenantId: "tenant-a",
        title: "Beta Project",
      },
      {
        createdAt: "2026-01-03T00:00:00.000Z",
        description: "Validation and release",
        id: "3",
        tenantId: "tenant-a",
        title: "Gamma Project",
      },
    ];

    registerSearchIndex({
      displayedAttributes: [
        "id",
        "tenantId",
        "title",
        "description",
        "createdAt",
      ],
      filterableAttributes: ["tenantId"],
      key: indexKey,
      searchableAttributes: ["title", "description"],
      sortableAttributes: ["createdAt"],
    });

    const indexer = createMeilisearchIndexer({
      apiKey: meilisearchApiKey,
      host: meilisearchUrl,
      indexPrefix,
    });
    const searchClient = createMeilisearchSearchClient({
      apiKey: meilisearchApiKey,
      host: meilisearchUrl,
      indexPrefix,
    });
    const client = getMeilisearchClient({
      apiKey: meilisearchApiKey,
      host: meilisearchUrl,
      indexPrefix,
    });

    try {
      await indexer.ensureIndex(indexKey);
      await indexer.indexDocuments(indexKey, documents);

      const stats = await indexer.getIndexStats(indexKey);
      expect(stats.indexName).toBe(indexName);
      expect(stats.numberOfDocuments).toBe(3);

      const searchResults = await searchClient.search({
        indices: [indexKey],
        limit: 10,
        query: "project",
        sort: ["createdAt:asc"],
      });

      expect(searchResults).toHaveLength(3);
      expect(searchResults.map((result) => result.id)).toEqual(["1", "2", "3"]);
      expect(searchResults[0].formatted.title).toBeDefined();

      const suggestions = await searchClient.suggest("project", {
        indices: [indexKey],
        limit: 10,
      });

      expect(suggestions).toHaveLength(3);
      expect(suggestions.map((suggestion) => suggestion.text).sort()).toEqual([
        "Alpha Project",
        "Beta Project",
        "Gamma Project",
      ]);
    } finally {
      try {
        const deleteTask = await client.deleteIndex(indexName);
        await waitForTask(deleteTask.taskUid);
      } catch {
        // Best-effort cleanup for failed or partially-created indexes.
      }

      clearSearchIndexRegistry();
    }
  }, 60_000);
});
