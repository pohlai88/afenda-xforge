CREATE TABLE "xforge"."lam_leave_carry_forward_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"leave_type_id" text NOT NULL,
	"code" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"scope" jsonb,
	"max_carry_forward_days" integer NOT NULL,
	"forfeit_unused" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_carry_forward_rules" ADD CONSTRAINT "lam_leave_carry_forward_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_carry_forward_rules" ADD CONSTRAINT "lam_leave_carry_forward_rules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lam_leave_carry_forward_rules_tenant_company_idx" ON "xforge"."lam_leave_carry_forward_rules" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lam_leave_carry_forward_rules_tenant_company_code_unique" ON "xforge"."lam_leave_carry_forward_rules" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "lam_leave_carry_forward_rules_leave_type_idx" ON "xforge"."lam_leave_carry_forward_rules" USING btree ("leave_type_id");
