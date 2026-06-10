CREATE TABLE "xforge"."offboarding_audit_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"actor_id" text,
	"action" varchar(128) NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" text NOT NULL,
	"summary" text,
	"reason" text,
	"sensitive" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."offboarding_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"lifecycle_exit_reference" text,
	"exit_type" varchar(64) NOT NULL,
	"status" varchar(32) NOT NULL,
	"reason" text NOT NULL,
	"reason_details" text,
	"effective_separation_date" timestamp with time zone NOT NULL,
	"notice_start_date" timestamp with time zone,
	"notice_end_date" timestamp with time zone,
	"required_notice_days" integer,
	"waived_notice" boolean DEFAULT false NOT NULL,
	"waived_notice_reason" text,
	"last_working_date" timestamp with time zone,
	"initiated_by" text,
	"initiation_source" varchar(32) NOT NULL,
	"legal_entity_code" varchar(96),
	"department_id" text,
	"manager_employee_id" text,
	"work_location_code" varchar(96),
	"policy_reference" text,
	"risk_level" varchar(32) NOT NULL,
	"legal_review_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_audit_references" ADD CONSTRAINT "offboarding_audit_references_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_audit_references" ADD CONSTRAINT "offboarding_audit_references_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_cases" ADD CONSTRAINT "offboarding_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_cases" ADD CONSTRAINT "offboarding_cases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offboarding_audit_refs_tenant_entity_idx" ON "xforge"."offboarding_audit_references" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "offboarding_audit_refs_tenant_action_idx" ON "xforge"."offboarding_audit_references" USING btree ("tenant_id","action");--> statement-breakpoint
CREATE INDEX "offboarding_audit_refs_tenant_company_created_idx" ON "xforge"."offboarding_audit_references" USING btree ("tenant_id","company_id","created_at");--> statement-breakpoint
CREATE INDEX "offboarding_cases_tenant_company_employee_idx" ON "xforge"."offboarding_cases" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "offboarding_cases_tenant_company_status_idx" ON "xforge"."offboarding_cases" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "offboarding_cases_tenant_company_exit_type_idx" ON "xforge"."offboarding_cases" USING btree ("tenant_id","company_id","exit_type");--> statement-breakpoint
CREATE INDEX "offboarding_cases_tenant_company_effective_idx" ON "xforge"."offboarding_cases" USING btree ("tenant_id","company_id","effective_separation_date");