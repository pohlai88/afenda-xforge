CREATE TABLE "xforge"."hr_offboarding_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" text NOT NULL,
	"case_number" varchar(96) NOT NULL,
	"case_title" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"exit_type" varchar(64) NOT NULL,
	"lifecycle_source_feature_id" varchar(160) NOT NULL,
	"lifecycle_source_event_id" text NOT NULL,
	"lifecycle_trigger_snapshot" jsonb NOT NULL,
	"effective_separation_date" timestamp with time zone,
	"last_working_date" timestamp with time zone,
	"notice_start_date" timestamp with time zone,
	"notice_end_date" timestamp with time zone,
	"coordinator_actor_id" text,
	"requested_by_actor_id" text,
	"reason_summary" text,
	"rehire_eligibility" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."hr_offboarding_cases" ADD CONSTRAINT "hr_offboarding_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_offboarding_cases" ADD CONSTRAINT "hr_offboarding_cases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_tenant_company_idx" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_tenant_company_employee_idx" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_tenant_company_status_idx" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_tenant_company_exit_type_idx" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id","exit_type");--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_tenant_company_last_working_idx" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id","last_working_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_offboarding_cases_tenant_company_case_number_unique" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id","case_number");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_offboarding_cases_tenant_company_lifecycle_event_unique" ON "xforge"."hr_offboarding_cases" USING btree ("tenant_id","company_id","lifecycle_source_event_id");