CREATE TABLE "xforge"."lam_company_attendance_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"attendance_corrections_enabled" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."lam_company_attendance_settings" ADD CONSTRAINT "lam_company_attendance_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_company_attendance_settings" ADD CONSTRAINT "lam_company_attendance_settings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lam_company_attendance_settings_tenant_company_unique" ON "xforge"."lam_company_attendance_settings" USING btree ("tenant_id","company_id");
