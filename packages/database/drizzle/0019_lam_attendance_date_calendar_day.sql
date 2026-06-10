DROP INDEX IF EXISTS "xforge"."lam_attendance_records_tenant_company_employee_date_unique";--> statement-breakpoint
UPDATE "xforge"."lam_attendance_records"
SET "attendance_date" = date_trunc('day', "attendance_date" AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
WHERE "attendance_date" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "xforge"."lam_attendance_records"
ALTER COLUMN "attendance_date" TYPE date
USING ("attendance_date" AT TIME ZONE 'UTC')::date;--> statement-breakpoint
CREATE UNIQUE INDEX "lam_attendance_records_tenant_company_employee_date_unique" ON "xforge"."lam_attendance_records" USING btree ("tenant_id","company_id","employee_id","attendance_date");
