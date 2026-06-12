import "server-only";

import { database, timeDatabaseQuery } from "@repo/database";
import { workspaceSearchDocuments } from "@repo/database/schema";
import { and, eq } from "drizzle-orm";
import type { SearchDocument } from "../../types.ts";
import { hasPostgresSearchConfig } from "../keys.ts";
import { mapSearchDocumentToUpsert } from "../internal.ts";

export const upsertWorkspaceSearchDocument = async (
  entityType: string,
  document: SearchDocument
): Promise<void> => {
  if (!hasPostgresSearchConfig()) {
    return;
  }

  const mapped = mapSearchDocumentToUpsert(entityType, document);
  const now = new Date();

  await timeDatabaseQuery(
    () =>
      database
        .insert(workspaceSearchDocuments)
        .values({
          companyId: mapped.companyId,
          description: mapped.description,
          entityId: mapped.entityId,
          entityType: mapped.entityType,
          indexedAt: now,
          metadata: mapped.metadata,
          tenantId: mapped.tenantId,
          title: mapped.title,
          updatedAt: now,
          url: mapped.url,
          deletedAt: null,
        })
        .onConflictDoUpdate({
          target: [
            workspaceSearchDocuments.tenantId,
            workspaceSearchDocuments.entityType,
            workspaceSearchDocuments.entityId,
          ],
          set: {
            companyId: mapped.companyId,
            description: mapped.description,
            indexedAt: now,
            metadata: mapped.metadata,
            title: mapped.title,
            updatedAt: now,
            url: mapped.url,
            deletedAt: null,
          },
        }),
    {
      operation: "upsert",
      resource: "workspace_search_documents",
      metadata: {
        entityType: mapped.entityType,
        tenantId: mapped.tenantId,
      },
    }
  );
};

export const softDeleteWorkspaceSearchDocument = async (
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<void> => {
  if (!hasPostgresSearchConfig()) {
    return;
  }

  const now = new Date();

  await timeDatabaseQuery(
    () =>
      database
        .update(workspaceSearchDocuments)
        .set({
          deletedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(workspaceSearchDocuments.tenantId, tenantId),
            eq(workspaceSearchDocuments.entityType, entityType),
            eq(workspaceSearchDocuments.entityId, entityId)
          )
        ),
    {
      operation: "update",
      resource: "workspace_search_documents",
      metadata: {
        entityType,
        tenantId,
      },
    }
  );
};
