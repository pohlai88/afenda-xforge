CREATE TABLE IF NOT EXISTS "xforge"."workspace_search_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "company_id" uuid,
  "entity_type" varchar(128) NOT NULL,
  "entity_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "url" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "xforge"."workspace_search_documents"
ADD CONSTRAINT "workspace_search_documents_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "xforge"."workspace_search_documents"
ADD CONSTRAINT "workspace_search_documents_company_id_companies_id_fk"
FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_search_documents_entity_unique"
ON "xforge"."workspace_search_documents" USING btree ("tenant_id", "entity_type", "entity_id");

CREATE INDEX IF NOT EXISTS "workspace_search_documents_tenant_entity_type_idx"
ON "xforge"."workspace_search_documents" USING btree ("tenant_id", "entity_type");

ALTER TABLE "xforge"."workspace_search_documents"
ADD COLUMN "search_vector" tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A')
  || setweight(to_tsvector('english', coalesce("description", '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS "workspace_search_documents_search_vector_idx"
ON "xforge"."workspace_search_documents" USING GIN ("search_vector");
