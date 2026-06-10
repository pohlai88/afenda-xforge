CREATE TABLE "xforge"."lam_attendance_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"attendance_record_id" uuid NOT NULL,
	"exception_type" varchar(32) NOT NULL,
	"requested_status" varchar(32) NOT NULL,
	"requested_clock_in_at" timestamp with time zone,
	"requested_clock_out_at" timestamp with time zone,
	"reason" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"approval_route_id" uuid,
	"current_step_order" integer,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"submitted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."lam_attendance_corrections" ADD CONSTRAINT "lam_attendance_corrections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_attendance_corrections" ADD CONSTRAINT "lam_attendance_corrections_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_attendance_corrections" ADD CONSTRAINT "lam_attendance_corrections_attendance_record_id_lam_attendance_records_id_fk" FOREIGN KEY ("attendance_record_id") REFERENCES "xforge"."lam_attendance_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_attendance_corrections" ADD CONSTRAINT "lam_attendance_corrections_approval_route_id_lam_leave_approval_routes_id_fk" FOREIGN KEY ("approval_route_id") REFERENCES "xforge"."lam_leave_approval_routes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lam_attendance_corrections_tenant_company_employee_idx" ON "xforge"."lam_attendance_corrections" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "lam_attendance_corrections_tenant_company_status_idx" ON "xforge"."lam_attendance_corrections" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "lam_attendance_corrections_record_exception_idx" ON "xforge"."lam_attendance_corrections" USING btree ("attendance_record_id","exception_type");
