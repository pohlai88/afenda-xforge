ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "document_kind" varchar(64) DEFAULT 'supporting_document' NOT NULL;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "panel_clinic_id" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "panel_clinic_name" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "issued_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "hospitalization_admission_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "hospitalization_discharge_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."lam_leave_documents" ADD COLUMN "source_document_id" text;--> statement-breakpoint
CREATE INDEX "lam_leave_documents_document_kind_idx" ON "xforge"."lam_leave_documents" USING btree ("tenant_id","company_id","document_kind");
