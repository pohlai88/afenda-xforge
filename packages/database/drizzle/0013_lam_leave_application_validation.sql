ALTER TABLE "xforge"."lam_leave_types" ADD COLUMN "min_notice_days" integer;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_types" ADD COLUMN "max_consecutive_days" integer;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_types" ADD COLUMN "eligibility_tenure_months_min" integer;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_types" ADD COLUMN "eligibility_gender" varchar(16);--> statement-breakpoint
CREATE TABLE "xforge"."lam_leave_blackout_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"leave_type_id" text,
	"code" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"scope" jsonb,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_blackout_periods" ADD CONSTRAINT "lam_leave_blackout_periods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_blackout_periods" ADD CONSTRAINT "lam_leave_blackout_periods_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lam_leave_blackout_periods_tenant_company_idx" ON "xforge"."lam_leave_blackout_periods" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_blackout_periods_tenant_company_code_unique" ON "xforge"."lam_leave_blackout_periods" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "lam_leave_blackout_periods_leave_type_idx" ON "xforge"."lam_leave_blackout_periods" USING btree ("leave_type_id");
