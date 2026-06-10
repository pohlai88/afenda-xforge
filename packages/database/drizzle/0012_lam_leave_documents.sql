CREATE TABLE "xforge"."lam_leave_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"employee_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" varchar(128) NOT NULL,
	"status" varchar(32) NOT NULL,
	"reference_number" text,
	"leave_application_id" text,
	"uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD CONSTRAINT "lam_leave_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD CONSTRAINT "lam_leave_documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lam_leave_documents_tenant_company_employee_idx" ON "xforge"."lam_leave_documents" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "lam_leave_documents_tenant_company_status_idx" ON "xforge"."lam_leave_documents" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "lam_leave_documents_leave_application_idx" ON "xforge"."lam_leave_documents" USING btree ("leave_application_id");
