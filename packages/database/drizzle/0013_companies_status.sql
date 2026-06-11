ALTER TABLE "xforge"."companies"
  ADD COLUMN IF NOT EXISTS "status" varchar(16) DEFAULT 'active' NOT NULL;

CREATE INDEX IF NOT EXISTS "companies_tenant_status_idx"
  ON "xforge"."companies" USING btree ("tenant_id", "status");
