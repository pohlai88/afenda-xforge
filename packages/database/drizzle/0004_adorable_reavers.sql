CREATE TABLE "xforge"."compliance_alert_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"alert_id" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"actor_id" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_audit_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"audit_event_id" uuid,
	"action" varchar(128) NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_corrective_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"obligation_id" uuid NOT NULL,
	"requirement_id" text NOT NULL,
	"exception_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"owner_id" text,
	"status" varchar(32) NOT NULL,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_evidence_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"obligation_id" uuid NOT NULL,
	"requirement_id" text,
	"evidence_type" varchar(96) NOT NULL,
	"title" text NOT NULL,
	"source_document_id" text,
	"source_document_number" text,
	"source_notes" text,
	"sensitivity" varchar(32) NOT NULL,
	"status" varchar(32) NOT NULL,
	"issued_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"obligation_id" uuid NOT NULL,
	"requirement_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"owner_id" text,
	"due_at" timestamp with time zone,
	"waiver_expires_at" timestamp with time zone,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"resolution_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_filings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"obligation_id" uuid NOT NULL,
	"filing_code" varchar(96) NOT NULL,
	"title" text NOT NULL,
	"jurisdiction_source" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"status" varchar(32) NOT NULL,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confirmation_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_obligations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"code" varchar(96) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requirement_kind" varchar(64) NOT NULL,
	"severity" varchar(32) NOT NULL,
	"scope" jsonb NOT NULL,
	"expected_evidence_type" varchar(96) NOT NULL,
	"initial_due_in_days" integer,
	"renewal_every_days" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"jurisdiction_source" text NOT NULL,
	"version" varchar(64) NOT NULL,
	"owner_team" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."compliance_worker_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"employee_number" varchar(96) NOT NULL,
	"display_name" text NOT NULL,
	"legal_entity_code" varchar(96),
	"country_code" varchar(8),
	"work_location_code" varchar(96),
	"employment_type" varchar(96),
	"worker_category" varchar(96),
	"department_id" text,
	"hire_date" timestamp with time zone,
	"termination_date" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."compliance_alert_states" ADD CONSTRAINT "compliance_alert_states_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_alert_states" ADD CONSTRAINT "compliance_alert_states_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_audit_references" ADD CONSTRAINT "compliance_audit_references_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_audit_references" ADD CONSTRAINT "compliance_audit_references_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_corrective_actions" ADD CONSTRAINT "compliance_corrective_actions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_corrective_actions" ADD CONSTRAINT "compliance_corrective_actions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_evidence_artifacts" ADD CONSTRAINT "compliance_evidence_artifacts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_evidence_artifacts" ADD CONSTRAINT "compliance_evidence_artifacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_exceptions" ADD CONSTRAINT "compliance_exceptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_exceptions" ADD CONSTRAINT "compliance_exceptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_filings" ADD CONSTRAINT "compliance_filings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_filings" ADD CONSTRAINT "compliance_filings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_obligations" ADD CONSTRAINT "compliance_obligations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_obligations" ADD CONSTRAINT "compliance_obligations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_worker_profiles" ADD CONSTRAINT "compliance_worker_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."compliance_worker_profiles" ADD CONSTRAINT "compliance_worker_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_alert_states_tenant_alert_unique" ON "xforge"."compliance_alert_states" USING btree ("tenant_id","alert_id");--> statement-breakpoint
CREATE INDEX "compliance_alert_states_tenant_company_status_idx" ON "xforge"."compliance_alert_states" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "compliance_audit_refs_tenant_entity_idx" ON "xforge"."compliance_audit_references" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "compliance_audit_refs_tenant_action_idx" ON "xforge"."compliance_audit_references" USING btree ("tenant_id","action");--> statement-breakpoint
CREATE INDEX "compliance_corrective_actions_tenant_company_status_idx" ON "xforge"."compliance_corrective_actions" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "compliance_corrective_actions_requirement_idx" ON "xforge"."compliance_corrective_actions" USING btree ("requirement_id");--> statement-breakpoint
CREATE INDEX "compliance_evidence_tenant_company_employee_idx" ON "xforge"."compliance_evidence_artifacts" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "compliance_evidence_obligation_idx" ON "xforge"."compliance_evidence_artifacts" USING btree ("obligation_id");--> statement-breakpoint
CREATE INDEX "compliance_exceptions_tenant_company_status_idx" ON "xforge"."compliance_exceptions" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "compliance_exceptions_requirement_idx" ON "xforge"."compliance_exceptions" USING btree ("requirement_id");--> statement-breakpoint
CREATE INDEX "compliance_filings_tenant_company_status_due_idx" ON "xforge"."compliance_filings" USING btree ("tenant_id","company_id","status","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_filings_tenant_company_code_unique" ON "xforge"."compliance_filings" USING btree ("tenant_id","company_id","filing_code");--> statement-breakpoint
CREATE INDEX "compliance_obligations_tenant_company_idx" ON "xforge"."compliance_obligations" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_obligations_tenant_company_code_unique" ON "xforge"."compliance_obligations" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "compliance_worker_profiles_tenant_company_idx" ON "xforge"."compliance_worker_profiles" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_worker_profiles_tenant_employee_unique" ON "xforge"."compliance_worker_profiles" USING btree ("tenant_id","company_id","employee_id");