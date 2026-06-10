CREATE TABLE "xforge"."hr_delegation_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"grantor_id" text NOT NULL,
	"grantee_id" text NOT NULL,
	"capabilities" jsonb NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "xforge"."hr_delegation_grants" ADD CONSTRAINT "hr_delegation_grants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "xforge"."hr_delegation_grants" ADD CONSTRAINT "hr_delegation_grants_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "hr_delegation_grants_tenant_company_grantee_idx" ON "xforge"."hr_delegation_grants" USING btree ("tenant_id","company_id","grantee_id");
