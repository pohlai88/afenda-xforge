import "server-only";

import type { Index, Meilisearch, Settings } from "meilisearch";
import {
  buildSearchIndexName,
  requireSearchIndexDefinition,
} from "../registry.ts";
import type {
  MeilisearchConfig,
  SearchDocument,
  SearchIndexDefinition,
  SearchIndexStats,
} from "../types.ts";
import { getMeilisearchClient, getMeilisearchConfig } from "./client.ts";

const DEFAULT_VIETNAMESE_STOP_WORDS = [
  "va",
  "la",
  "duoc",
  "co",
  "cua",
  "de",
  "tu",
  "voi",
  "trong",
  "tren",
  "duoi",
  "mot",
  "nhung",
];

const waitForTask = async (
  client: Meilisearch,
  taskUid: number
): Promise<void> => {
  await client.tasks.waitForTask(taskUid);
};

const buildSettings = (definition: SearchIndexDefinition): Settings => ({
  displayedAttributes: definition.displayedAttributes,
  distinctAttribute: definition.distinctAttribute,
  filterableAttributes: definition.filterableAttributes,
  pagination:
    definition.maxTotalHits === undefined
      ? undefined
      : {
          maxTotalHits: definition.maxTotalHits,
        },
  rankingRules: definition.rankingRules,
  searchableAttributes: definition.searchableAttributes,
  sortableAttributes: definition.sortableAttributes,
  stopWords: definition.stopWords ?? DEFAULT_VIETNAMESE_STOP_WORDS,
  synonyms: definition.synonyms,
});

export class MeilisearchIndexer {
  private readonly client: Meilisearch;
  private readonly indexPrefix: string;

  constructor(config: Partial<MeilisearchConfig> = {}) {
    this.client = getMeilisearchClient(config);
    this.indexPrefix = getMeilisearchConfig(config).indexPrefix ?? "xforge";
  }

  private resolveIndexName(definition: SearchIndexDefinition): string {
    return (
      definition.name ?? buildSearchIndexName(definition.key, this.indexPrefix)
    );
  }

  private async resolveIndex(
    definition: SearchIndexDefinition
  ): Promise<Index<SearchDocument>> {
    const indexName = this.resolveIndexName(definition);
    const index = this.client.index<SearchDocument>(indexName);

    try {
      await index.fetchInfo();
    } catch {
      const task = await this.client.createIndex(indexName, {
        primaryKey: definition.primaryKey ?? "id",
      });
      await waitForTask(this.client, task.taskUid);
    }

    const settingsTask = await index.updateSettings(buildSettings(definition));
    await waitForTask(this.client, settingsTask.taskUid);

    return index;
  }

  async ensureIndex(indexKey: string): Promise<void> {
    await this.resolveIndex(requireSearchIndexDefinition(indexKey));
  }

  async ensureIndices(indexKeys: readonly string[]): Promise<void> {
    for (const indexKey of indexKeys) {
      await this.ensureIndex(indexKey);
    }
  }

  async indexDocument(
    indexKey: string,
    document: SearchDocument
  ): Promise<void> {
    await this.indexDocuments(indexKey, [document]);
  }

  async indexDocuments(
    indexKey: string,
    documents: readonly SearchDocument[],
    batchSize = 1000
  ): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    const definition = requireSearchIndexDefinition(indexKey);
    const index = await this.resolveIndex(definition);
    const primaryKey = definition.primaryKey ?? "id";

    for (let offset = 0; offset < documents.length; offset += batchSize) {
      const batch = documents.slice(offset, offset + batchSize);
      const task = await index.addDocuments(batch as SearchDocument[], {
        primaryKey,
      });
      await waitForTask(this.client, task.taskUid);
    }
  }

  async removeDocument(
    indexKey: string,
    documentId: string | number
  ): Promise<void> {
    const definition = requireSearchIndexDefinition(indexKey);
    const index = await this.resolveIndex(definition);
    const task = await index.deleteDocument(documentId);
    await waitForTask(this.client, task.taskUid);
  }

  async clearIndex(indexKey: string): Promise<void> {
    const definition = requireSearchIndexDefinition(indexKey);
    const index = await this.resolveIndex(definition);
    const task = await index.deleteAllDocuments();
    await waitForTask(this.client, task.taskUid);
  }

  async reindexAll(
    indexKey: string,
    loadDocuments: () => Promise<readonly SearchDocument[]>
  ): Promise<void> {
    const documents = await loadDocuments();
    await this.clearIndex(indexKey);
    await this.indexDocuments(indexKey, documents);
  }

  async getIndexStats(indexKey: string): Promise<SearchIndexStats> {
    const definition = requireSearchIndexDefinition(indexKey);
    const indexName = this.resolveIndexName(definition);
    const index = await this.resolveIndex(definition);
    const stats = await index.getStats();

    return {
      fieldDistribution: stats.fieldDistribution ?? {},
      indexKey: definition.key,
      indexName,
      isIndexing: stats.isIndexing,
      numberOfDocuments: stats.numberOfDocuments,
    };
  }
}

export const createMeilisearchIndexer = (
  config: Partial<MeilisearchConfig> = {}
): MeilisearchIndexer => new MeilisearchIndexer(config);
