CREATE TABLE "xforge"."module_console_operator_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"console_id" varchar(64) NOT NULL,
	"operator_user_id" text NOT NULL,
	"assigned_by" text NOT NULL,
	"capabilities" jsonb,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "xforge"."module_console_operator_assignments" ADD CONSTRAINT "module_console_operator_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "xforge"."module_console_operator_assignments" ADD CONSTRAINT "module_console_operator_assignments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "module_console_operator_assignments_tenant_console_idx" ON "xforge"."module_console_operator_assignments" USING btree ("tenant_id","console_id","company_id");
