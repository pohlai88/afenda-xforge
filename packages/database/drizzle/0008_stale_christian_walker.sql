ALTER TABLE "xforge"."companies" ADD COLUMN "status" varchar(16) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "parent_company_id" uuid;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "is_group" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "currency_code" varchar(3);--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "tax_id" varchar(64);--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "registration_number" varchar(64);--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "phone" varchar(64);--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "established_on" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD CONSTRAINT "companies_parent_company_id_companies_id_fk" FOREIGN KEY ("parent_company_id") REFERENCES "xforge"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_tenant_status_idx" ON "xforge"."companies" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "companies_tenant_parent_idx" ON "xforge"."companies" USING btree ("tenant_id","parent_company_id");--> statement-breakpoint
CREATE INDEX "companies_tenant_name_idx" ON "xforge"."companies" USING btree ("tenant_id","name");