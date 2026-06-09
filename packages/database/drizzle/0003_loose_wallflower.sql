CREATE TABLE "xforge"."webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"provider" varchar(64) NOT NULL,
	"endpoint_id" varchar(128) NOT NULL,
	"application_id" text,
	"application_name" text,
	"event_owner" varchar(128) NOT NULL,
	"schema_version" varchar(32) NOT NULL,
	"secret" text NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "webhook_endpoints_tenant_id_idx" ON "xforge"."webhook_endpoints" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_tenant_provider_status_idx" ON "xforge"."webhook_endpoints" USING btree ("tenant_id","provider","status");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_endpoints_provider_endpoint_unique" ON "xforge"."webhook_endpoints" USING btree ("provider","endpoint_id");