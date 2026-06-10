CREATE TABLE "xforge"."lam_leave_approval_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"code" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"leave_type_id" text,
	"scope" jsonb,
	"min_duration_days" integer,
	"max_duration_days" integer,
	"steps" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_approval_routes" ADD CONSTRAINT "lam_leave_approval_routes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_approval_routes" ADD CONSTRAINT "lam_leave_approval_routes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lam_leave_approval_routes_tenant_company_idx" ON "xforge"."lam_leave_approval_routes" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_approval_routes_tenant_company_code_unique" ON "xforge"."lam_leave_approval_routes" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "lam_leave_approval_routes_leave_type_idx" ON "xforge"."lam_leave_approval_routes" USING btree ("leave_type_id");--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD COLUMN "approval_route_id" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD COLUMN "current_step_order" integer;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD COLUMN "returned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_applications" ADD COLUMN "returned_reason" text;
