CREATE SCHEMA "xforge";
--> statement-breakpoint
CREATE TABLE "xforge"."companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."company_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"grant" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."notification_inbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"user_id" text NOT NULL,
	"event" varchar(128) NOT NULL,
	"topic" text NOT NULL,
	"payload" jsonb NOT NULL,
	"dispatched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seen_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(32) DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."companies" ADD CONSTRAINT "companies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."company_grants" ADD CONSTRAINT "company_grants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."company_grants" ADD CONSTRAINT "company_grants_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."notification_inbox" ADD CONSTRAINT "notification_inbox_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."notification_inbox" ADD CONSTRAINT "notification_inbox_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_tenant_id_idx" ON "xforge"."companies" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_tenant_code_unique" ON "xforge"."companies" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "company_grants_tenant_id_idx" ON "xforge"."company_grants" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "company_grants_company_id_idx" ON "xforge"."company_grants" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_grants_unique" ON "xforge"."company_grants" USING btree ("tenant_id","company_id","user_id","grant");--> statement-breakpoint
CREATE INDEX "notification_inbox_notification_id_idx" ON "xforge"."notification_inbox" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "notification_inbox_tenant_user_dispatched_idx" ON "xforge"."notification_inbox" USING btree ("tenant_id","user_id","dispatched_at");--> statement-breakpoint
CREATE INDEX "notification_inbox_tenant_company_user_dispatched_idx" ON "xforge"."notification_inbox" USING btree ("tenant_id","company_id","user_id","dispatched_at");--> statement-breakpoint
CREATE INDEX "tenant_memberships_tenant_id_idx" ON "xforge"."tenant_memberships" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_memberships_tenant_user_unique" ON "xforge"."tenant_memberships" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_unique" ON "xforge"."tenants" USING btree ("slug");