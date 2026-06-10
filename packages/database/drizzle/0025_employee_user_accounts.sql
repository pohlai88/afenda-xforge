CREATE TABLE "xforge"."employee_user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."employee_user_accounts" ADD CONSTRAINT "employee_user_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "xforge"."employee_user_accounts" ADD CONSTRAINT "employee_user_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "employee_user_accounts_tenant_company_idx" ON "xforge"."employee_user_accounts" USING btree ("tenant_id","company_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "employee_user_accounts_tenant_company_user_unique" ON "xforge"."employee_user_accounts" USING btree ("tenant_id","company_id","user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "employee_user_accounts_tenant_company_employee_unique" ON "xforge"."employee_user_accounts" USING btree ("tenant_id","company_id","employee_id");
