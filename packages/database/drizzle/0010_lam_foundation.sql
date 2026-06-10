CREATE TABLE "xforge"."lam_attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"attendance_date" timestamp with time zone NOT NULL,
	"status" varchar(32) NOT NULL,
	"work_calendar_id" text,
	"clock_in_at" timestamp with time zone,
	"clock_out_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."lam_leave_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"kind" varchar(64) NOT NULL,
	"policy_group_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"requires_document" boolean DEFAULT false NOT NULL,
	"paid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."lam_leave_entitlement_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"leave_type_id" text NOT NULL,
	"code" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"scope" jsonb,
	"entitlement_days" integer NOT NULL,
	"accrual_rule" text,
	"tenure_months_min" integer,
	"tenure_months_max" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."lam_leave_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"leave_type_id" text NOT NULL,
	"period_year" integer NOT NULL,
	"opening_balance" integer DEFAULT 0 NOT NULL,
	"earned" integer DEFAULT 0 NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"pending" integer DEFAULT 0 NOT NULL,
	"adjusted" integer DEFAULT 0 NOT NULL,
	"forfeited" integer DEFAULT 0 NOT NULL,
	"carried_forward" integer DEFAULT 0 NOT NULL,
	"remaining" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."lam_leave_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"leave_type_id" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text,
	"supporting_document_id" text,
	"rejection_reason" text,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."lam_audit_references" (
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
ALTER TABLE "xforge"."lam_attendance_records" ADD CONSTRAINT "lam_attendance_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_attendance_records" ADD CONSTRAINT "lam_attendance_records_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_types" ADD CONSTRAINT "lam_leave_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_types" ADD CONSTRAINT "lam_leave_types_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_entitlement_rules" ADD CONSTRAINT "lam_leave_entitlement_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_entitlement_rules" ADD CONSTRAINT "lam_leave_entitlement_rules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_balances" ADD CONSTRAINT "lam_leave_balances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_balances" ADD CONSTRAINT "lam_leave_balances_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD CONSTRAINT "lam_leave_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD CONSTRAINT "lam_leave_applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD CONSTRAINT "lam_audit_references_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD CONSTRAINT "lam_audit_references_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lam_attendance_records_tenant_company_employee_idx" ON "xforge"."lam_attendance_records" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "lam_attendance_records_tenant_company_status_idx" ON "xforge"."lam_attendance_records" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_attendance_records_tenant_company_employee_date_unique" ON "xforge"."lam_attendance_records" USING btree ("tenant_id","company_id","employee_id","attendance_date");--> statement-breakpoint
CREATE INDEX "lam_leave_types_tenant_company_idx" ON "xforge"."lam_leave_types" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_types_tenant_company_code_unique" ON "xforge"."lam_leave_types" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "lam_leave_entitlement_rules_tenant_company_idx" ON "xforge"."lam_leave_entitlement_rules" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_entitlement_rules_tenant_company_code_unique" ON "xforge"."lam_leave_entitlement_rules" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "lam_leave_entitlement_rules_leave_type_idx" ON "xforge"."lam_leave_entitlement_rules" USING btree ("leave_type_id");--> statement-breakpoint
CREATE INDEX "lam_leave_balances_tenant_company_employee_idx" ON "xforge"."lam_leave_balances" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_balances_tenant_company_employee_type_year_unique" ON "xforge"."lam_leave_balances" USING btree ("tenant_id","company_id","employee_id","leave_type_id","period_year");--> statement-breakpoint
CREATE INDEX "lam_leave_applications_tenant_company_employee_idx" ON "xforge"."lam_leave_applications" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "lam_leave_applications_tenant_company_status_idx" ON "xforge"."lam_leave_applications" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "lam_audit_refs_tenant_entity_idx" ON "xforge"."lam_audit_references" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "lam_audit_refs_tenant_action_idx" ON "xforge"."lam_audit_references" USING btree ("tenant_id","action");
