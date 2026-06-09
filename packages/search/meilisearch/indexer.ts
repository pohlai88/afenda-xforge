import "server-only";

import type { Index, Meilisearch } from "meilisearch";
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
import {
  assertPositiveInteger,
  buildIndexSettings,
  buildSettingsSignature,
  isMissingIndexError,
} from "./internal.ts";

const waitForTask = async (
  client: Meilisearch,
  taskUid: number,
  action: string
): Promise<void> => {
  try {
    await client.tasks.waitForTask(taskUid);
  } catch (error) {
    throw new Error(
      `Meilisearch task ${taskUid} failed while trying to ${action}`,
      {
        cause: error,
      }
    );
  }
};

export class MeilisearchIndexer {
  private readonly client: Meilisearch;
  private readonly indexPrefix: string;
  private readonly settingsSignatureCache = new Map<string, string>();

  constructor(config: Partial<MeilisearchConfig> = {}) {
    this.client = getMeilisearchClient(config);
    this.indexPrefix = getMeilisearchConfig(config).indexPrefix ?? "xforge";
  }

  private resolveIndexName(definition: SearchIndexDefinition): string {
    return (
      definition.name ?? buildSearchIndexName(definition.key, this.indexPrefix)
    );
  }

  private async createIndex(
    indexName: string,
    definition: SearchIndexDefinition
  ): Promise<void> {
    const task = await this.client.createIndex(indexName, {
      primaryKey: definition.primaryKey ?? "id",
    });
    await waitForTask(this.client, task.taskUid, `create index "${indexName}"`);
  }

  private async deleteIndexIfExists(indexName: string): Promise<void> {
    try {
      const task = await this.client.deleteIndex(indexName);
      await waitForTask(
        this.client,
        task.taskUid,
        `delete index "${indexName}"`
      );
    } catch (error) {
      if (isMissingIndexError(error)) {
        return;
      }

      throw new Error(`Unable to delete Meilisearch index "${indexName}"`, {
        cause: error,
      });
    } finally {
      this.settingsSignatureCache.delete(indexName);
    }
  }

  private async syncIndexSettings(
    index: Index<SearchDocument>,
    indexName: string,
    definition: SearchIndexDefinition
  ): Promise<void> {
    const settings = buildIndexSettings(definition);
    const settingsSignature = buildSettingsSignature(settings);

    if (this.settingsSignatureCache.get(indexName) === settingsSignature) {
      return;
    }

    const settingsTask = await index.updateSettings(settings);
    await waitForTask(
      this.client,
      settingsTask.taskUid,
      `update settings for "${indexName}"`
    );
    this.settingsSignatureCache.set(indexName, settingsSignature);
  }

  private async addDocumentsInBatches(
    index: Index<SearchDocument>,
    documents: readonly SearchDocument[],
    primaryKey: string,
    batchSize: number
  ): Promise<void> {
    for (let offset = 0; offset < documents.length; offset += batchSize) {
      const batch = documents.slice(offset, offset + batchSize);
      const task = await index.addDocuments([...batch], {
        primaryKey,
      });
      await waitForTask(
        this.client,
        task.taskUid,
        `index documents into "${index.uid}"`
      );
    }
  }

  private async hasIndex(indexName: string): Promise<boolean> {
    try {
      await this.client.index<SearchDocument>(indexName).fetchInfo();
      return true;
    } catch (error) {
      if (isMissingIndexError(error)) {
        return false;
      }

      throw new Error(`Unable to load Meilisearch index "${indexName}"`, {
        cause: error,
      });
    }
  }

  private buildReindexIndexName(indexName: string): string {
    return `${indexName}__reindex__${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private async resolveIndex(
    definition: SearchIndexDefinition,
    options: { createIfMissing?: boolean; syncSettings?: boolean } = {}
  ): Promise<Index<SearchDocument>> {
    const createIfMissing = options.createIfMissing ?? true;
    const syncSettings = options.syncSettings ?? false;
    const indexName = this.resolveIndexName(definition);
    const index = this.client.index<SearchDocument>(indexName);

    try {
      await index.fetchInfo();
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw new Error(`Unable to load Meilisearch index "${indexName}"`, {
          cause: error,
        });
      }

      if (!createIfMissing) {
        throw new Error(`Meilisearch index "${indexName}" does not exist`, {
          cause: error,
        });
      }

      await this.createIndex(indexName, definition);
    }

    if (syncSettings) {
      await this.syncIndexSettings(index, indexName, definition);
    }

    return index;
  }

  async ensureIndex(indexKey: string): Promise<void> {
    await this.resolveIndex(requireSearchIndexDefinition(indexKey), {
      syncSettings: true,
    });
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

    assertPositiveInteger(batchSize, "Meilisearch batch size");

    const definition = requireSearchIndexDefinition(indexKey);
    const index = await this.resolveIndex(definition, {
      syncSettings: true,
    });
    const primaryKey = definition.primaryKey ?? "id";
    await this.addDocumentsInBatches(index, documents, primaryKey, batchSize);
  }

  async removeDocument(
    indexKey: string,
    documentId: string | number
  ): Promise<void> {
    const definition = requireSearchIndexDefinition(indexKey);
    const index = await this.resolveIndex(definition, {
      createIfMissing: false,
    });
    const task = await index.deleteDocument(documentId);
    await waitForTask(
      this.client,
      task.taskUid,
      `delete document "${documentId}" from "${index.uid}"`
    );
  }

  async clearIndex(indexKey: string): Promise<void> {
    const definition = requireSearchIndexDefinition(indexKey);
    const index = await this.resolveIndex(definition, {
      createIfMissing: false,
    });
    const task = await index.deleteAllDocuments();
    await waitForTask(this.client, task.taskUid, `clear index "${index.uid}"`);
  }

  async reindexAll(
    indexKey: string,
    loadDocuments: () => Promise<readonly SearchDocument[]>
  ): Promise<void> {
    const definition = requireSearchIndexDefinition(indexKey);
    const documents = await loadDocuments();
    const liveIndexName = this.resolveIndexName(definition);
    const primaryKey = definition.primaryKey ?? "id";

    if (!(await this.hasIndex(liveIndexName))) {
      await this.ensureIndex(indexKey);
      await this.clearIndex(indexKey);
      if (documents.length > 0) {
        await this.indexDocuments(indexKey, documents);
      }
      return;
    }

    const stagingIndexName = this.buildReindexIndexName(liveIndexName);
    const stagingIndex = this.client.index<SearchDocument>(stagingIndexName);

    try {
      await this.createIndex(stagingIndexName, definition);
      await this.syncIndexSettings(stagingIndex, stagingIndexName, definition);

      if (documents.length > 0) {
        await this.addDocumentsInBatches(
          stagingIndex,
          documents,
          primaryKey,
          1000
        );
      }

      const swapTask = await this.client.swapIndexes([
        {
          indexes: [liveIndexName, stagingIndexName],
          rename: false,
        },
      ]);
      await waitForTask(
        this.client,
        swapTask.taskUid,
        `swap indexes "${liveIndexName}" and "${stagingIndexName}"`
      );
      await this.deleteIndexIfExists(stagingIndexName);
    } catch (error) {
      try {
        await this.deleteIndexIfExists(stagingIndexName);
      } catch {
        // Best-effort cleanup after a failed reindex attempt.
      }

      throw new Error(
        `Unable to reindex Meilisearch index "${liveIndexName}"`,
        {
          cause: error,
        }
      );
    }
  }

  async getIndexStats(indexKey: string): Promise<SearchIndexStats> {
    const definition = requireSearchIndexDefinition(indexKey);
    const indexName = this.resolveIndexName(definition);
    const index = await this.resolveIndex(definition, {
      createIfMissing: false,
    });
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
