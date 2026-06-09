CREATE TABLE "xforge"."employee_record_assignment_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" text NOT NULL,
	"department_id" text,
	"position_id" text,
	"work_location_code" varchar(96),
	"manager_employee_id" text,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"source" varchar(64) NOT NULL,
	"reason" text,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."employee_record_assignment_history" ADD CONSTRAINT "employee_record_assignment_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."employee_record_assignment_history" ADD CONSTRAINT "employee_record_assignment_history_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employee_record_assignment_history_tenant_company_employee_idx" ON "xforge"."employee_record_assignment_history" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "employee_record_assignment_history_tenant_company_department_idx" ON "xforge"."employee_record_assignment_history" USING btree ("tenant_id","company_id","department_id");--> statement-breakpoint
CREATE INDEX "employee_record_assignment_history_tenant_company_manager_idx" ON "xforge"."employee_record_assignment_history" USING btree ("tenant_id","company_id","manager_employee_id");--> statement-breakpoint
CREATE INDEX "employee_record_assignment_history_tenant_company_location_idx" ON "xforge"."employee_record_assignment_history" USING btree ("tenant_id","company_id","work_location_code");--> statement-breakpoint
CREATE INDEX "employee_record_assignment_history_tenant_company_effective_idx" ON "xforge"."employee_record_assignment_history" USING btree ("tenant_id","company_id","effective_from");