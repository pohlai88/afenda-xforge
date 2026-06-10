CREATE TABLE "xforge"."offboarding_approval_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"case_id" uuid NOT NULL,
	"employee_id" text NOT NULL,
	"exit_type" varchar(64) NOT NULL,
	"legal_entity_code" varchar(96),
	"department_id" text,
	"risk_level" varchar(32) NOT NULL,
	"legal_review_required" boolean DEFAULT false NOT NULL,
	"step_code" varchar(96) NOT NULL,
	"step_label" text NOT NULL,
	"sequence" integer NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"status" varchar(32) NOT NULL,
	"route_to_type" varchar(32) NOT NULL,
	"route_to_id" text NOT NULL,
	"route_to_label" text,
	"escalation_target_type" varchar(32),
	"escalation_target_id" text,
	"escalation_target_label" text,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"approved_at" timestamp with time zone,
	"approved_by" text,
	"rejected_at" timestamp with time zone,
	"rejected_by" text,
	"rejection_reason" text,
	"decision_notes" text,
	"reopened_at" timestamp with time zone,
	"reopened_by" text,
	"reopened_reason" text,
	"escalated_at" timestamp with time zone,
	"escalated_by" text,
	"escalation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_approval_steps" ADD CONSTRAINT "offboarding_approval_steps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_approval_steps" ADD CONSTRAINT "offboarding_approval_steps_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."offboarding_approval_steps" ADD CONSTRAINT "offboarding_approval_steps_case_id_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "xforge"."offboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offboarding_approval_steps_tenant_case_idx" ON "xforge"."offboarding_approval_steps" USING btree ("tenant_id","case_id");--> statement-breakpoint
CREATE INDEX "offboarding_approval_steps_tenant_company_status_idx" ON "xforge"."offboarding_approval_steps" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "offboarding_approval_steps_tenant_company_employee_idx" ON "xforge"."offboarding_approval_steps" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "offboarding_approval_steps_tenant_company_route_idx" ON "xforge"."offboarding_approval_steps" USING btree ("tenant_id","company_id","route_to_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offboarding_approval_steps_tenant_case_step_sequence_uidx" ON "xforge"."offboarding_approval_steps" USING btree ("tenant_id","case_id","step_code","sequence");