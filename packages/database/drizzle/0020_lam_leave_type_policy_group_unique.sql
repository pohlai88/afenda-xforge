DROP INDEX IF EXISTS "xforge"."lam_leave_types_tenant_company_code_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_types_tenant_company_code_policy_group_unique" ON "xforge"."lam_leave_types" USING btree ("tenant_id", "company_id", "code", COALESCE("policy_group_id", ''));--> statement-breakpoint
CREATE INDEX "lam_leave_types_tenant_company_policy_group_idx" ON "xforge"."lam_leave_types" USING btree ("tenant_id", "company_id", "policy_group_id");
