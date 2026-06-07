CREATE TABLE "xforge"."customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"email" text,
	"name" text NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_tenant_id_idx" ON "xforge"."customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "customers_tenant_status_idx" ON "xforge"."customers" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_tenant_code_unique" ON "xforge"."customers" USING btree ("tenant_id","code");